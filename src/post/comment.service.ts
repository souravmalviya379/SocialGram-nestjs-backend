import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import mongoose from 'mongoose';
import { PostService } from 'src/post/post.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentIdDto } from './dtos/commentId.dto';
import { CommentLikes } from './schemas/commentLIkes.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: mongoose.Model<Comment>,

    @InjectModel(CommentLikes.name)
    private commentLikesModel: mongoose.Model<CommentLikes>,

    private postService: PostService,
  ) {}

  async create(
    userId: mongoose.Types.ObjectId | string,
    postId: mongoose.Types.ObjectId | string,
    createCommentDto: CreateCommentDto,
  ) {
    try {
      const existingPost = await this.postService.getById(postId);
      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }

      const newComment = await this.commentModel.create({
        user: new mongoose.Types.ObjectId(userId),
        post: new mongoose.Types.ObjectId(postId),
        content: createCommentDto.content,
      });

      return { message: 'Comment added', newComment };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while commenting to post : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while commenting',
        );
      }
    }
  }

  async createReply(
    userId: mongoose.Types.ObjectId | string,
    commentId: mongoose.Types.ObjectId | string,
    createReplyDto: CreateCommentDto,
  ) {
    try {
      const existingComment = await this.commentModel.findById(commentId);
      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      const reply = await this.commentModel.create({
        user: new mongoose.Types.ObjectId(userId),
        post: existingComment.post._id,
        parentComment: existingComment._id,
        content: createReplyDto.content,
      });

      return { message: 'Reply added to comment', reply };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while replying to comment : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while replying',
        );
      }
    }
  }

  async getById(commentId: mongoose.Types.ObjectId | string) {
    return await this.commentModel.findById(commentId);
  }

  async getPostComments(postId: mongoose.Types.ObjectId | string) {
    try {
      const existingPost = await this.postService.getById(postId);
      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }
      const comments = await this.commentModel.aggregate([
        {
          $match: {
            post: new mongoose.Types.ObjectId(postId),
            parentComment: null,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [
              { $project: { name: true, username: true, image: true } },
            ],
            as: 'user',
          },
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);

      return { comments };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while fetching post comments : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while fetching comments',
        );
      }
    }
  }

  async getCommentReplies(commentId: mongoose.Types.ObjectId | string) {
    try {
      const comment = await this.commentModel.findById(commentId);
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const replies = await this.commentModel.aggregate([
        {
          $match: {
            parentComment: new mongoose.Types.ObjectId(commentId),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [
              { $project: { name: true, username: true, image: true } },
            ],
            as: 'user',
          },
        },
        {
          $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);

      return { replies };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while fetching replies');
        throw new InternalServerErrorException(
          'Something went wrong while fetching replies',
        );
      }
    }
  }

  async edit(
    userId: mongoose.Types.ObjectId | string,
    commentId: mongoose.Types.ObjectId | string,
    editCommentDto: CreateCommentDto,
  ) {
    try {
      const existingComment = await this.commentModel.findById(commentId);
      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      if (existingComment.user._id.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'User is not authorized to edit this comment',
        );
      }

      existingComment.content = editCommentDto.content;
      await existingComment.save();

      return { message: 'Comment updated', updatedComment: existingComment };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.log('Error while editing comment : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while editing comment',
        );
      }
    }
  }

  async delete(
    userId: mongoose.Types.ObjectId | string,
    commentIdDto: CommentIdDto,
  ) {
    try {
      const { commentId } = commentIdDto;
      const existingComment = await this.commentModel.findById(commentId);
      if (!existingComment) {
        throw new NotFoundException('Comment not found');
      }

      if (existingComment.user._id.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'User not authorized to delete this comment',
        );
      }

      //delete likes associated with comment and its replies
      await this.commentLikesModel.deleteMany({
        comment: new mongoose.Types.ObjectId(commentId),
      });

      const replies = await this.commentModel.find({
        parentComment: new mongoose.Types.ObjectId(commentId),
      });
      const replyIds = replies.map((reply) => {
        return { comment: reply._id };
      });

      await this.commentLikesModel.deleteMany({ $or: replyIds });

      //delete all the replies to the comment if exists
      await this.commentModel.deleteMany({
        parentComment: new mongoose.Types.ObjectId(commentId),
      });

      //finally delete comment
      await this.commentModel.findByIdAndDelete(commentId);

      return {
        message: 'Comment and associated replies deleted',
        deletedComment: existingComment,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.log('Error while deleting comment : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while deleting comment',
        );
      }
    }
  }
}

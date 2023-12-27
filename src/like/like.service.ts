import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { PostLikes } from './schemas/postLikes.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PostService } from 'src/post/post.service';
import { PaginationQueryDto } from 'src/common/dtos/paginationQuery.dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(PostLikes.name)
    private postLikesModel: mongoose.Model<PostLikes>,
    private postService: PostService,
  ) {}

  async hasUserLikedPost(userId, postId) {
    const existingLike = await this.postLikesModel.findOne({
      user: new mongoose.Types.ObjectId(userId),
      post: new mongoose.Types.ObjectId(postId),
    });

    if (!existingLike) {
      return false;
    } else {
      return true;
    }
  }

  async likePost(
    userId: mongoose.Types.ObjectId | string,
    postId: mongoose.Types.ObjectId | string,
  ) {
    try {
      const existingPost = await this.postService.getById(postId);
      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }

      if (await this.hasUserLikedPost(userId, postId)) {
        //remove like if user has already rated given post
        await this.postLikesModel.findOneAndDelete({
          user: new mongoose.Types.ObjectId(userId),
          post: new mongoose.Types.ObjectId(postId),
        });
        return { message: 'Like removed from post' };
      }

      const like = await this.postLikesModel.create({
        user: new mongoose.Types.ObjectId(userId),
        post: new mongoose.Types.ObjectId(postId),
      });

      return { message: 'Like added to post', like };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while liking post : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while liking post',
        );
      }
    }
  }

  async getPostLikesCount(postId: mongoose.Types.ObjectId | string) {
    try {
      const existingPost = await this.postService.getById(postId);
      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }

      return await this.postLikesModel.countDocuments({
        post: new mongoose.Types.ObjectId(postId),
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  async getPostLikes(
    postId: mongoose.Types.ObjectId | string,
    paginationQuertyDto: PaginationQueryDto,
  ) {
    const { page, limit } = paginationQuertyDto;
    try {
      const existingPost = await this.postService.getById(postId);
      if (!existingPost) {
        throw new NotFoundException('Post not found');
      }

      const likes = await this.postLikesModel.aggregate([
        {
          $match: { post: new mongoose.Types.ObjectId(postId) },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: true,
                  username: true,
                  image: true,
                },
              },
            ],
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);

      const totalLikesCount = await this.getPostLikesCount(postId);
      const totalPages = Math.ceil(totalLikesCount / limit);

      return {
        message: 'Post likes fetched',
        likes,
        totalLikesCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while fetching post likes : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while fetching post likes',
        );
      }
    }
  }
}

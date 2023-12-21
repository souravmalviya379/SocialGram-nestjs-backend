import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { CreatePostDto } from './dtos/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import { UserService } from 'src/user/user.service';
import {
  MAX_IMAGES_COUNT,
  POST_IMAGE_PATH,
} from 'utils/post-images-upload.config';
import removeFile from 'utils/remove-file';
import { DeletePostImagesDto } from './dtos/delete-postImage.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private postModel: mongoose.Model<Post>,
    private userService: UserService,
  ) {}

  async create(
    userId: mongoose.Types.ObjectId | string,
    createPostDto: CreatePostDto,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const { content } = createPostDto;
      const newPost = new this.postModel({
        user: new mongoose.Types.ObjectId(userId),
        content,
      });

      if (files && files.length) {
        files.map((file) => {
          newPost.images.push(`${POST_IMAGE_PATH}/${file.filename}`);
        });
      }
      await newPost.save();
      return { message: 'Post created successfully', newPost };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while creating post : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while creating post',
        );
      }
    }
  }

  async editPostContent(
    userId: mongoose.Types.ObjectId | string,
    postId: mongoose.Types.ObjectId | string,
    editPostDto: CreatePostDto,
  ) {
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException(`Post with id ${postId} not found`);
      }

      if (post.user._id.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'User is not authorized to edit this post',
        );
      }

      const { content } = editPostDto;
      post.content = content;
      await post.save();

      return { message: 'Post content updated successfully', post };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.log('Error while editing post : ', error);
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }

  async addImages(
    userId: mongoose.Types.ObjectId | string,
    postId: mongoose.Types.ObjectId | string,
    files: Array<Express.Multer.File>,
  ) {
    let postUpdatedFlag = false;
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException(`Post with id ${postId} not found`);
      }
      if (post.user._id.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'User is not authorized to edit this post',
        );
      }

      if (files && files.length) {
        if (post.images.length + files.length >= MAX_IMAGES_COUNT) {
          throw new BadRequestException(
            `You can upload maximum ${MAX_IMAGES_COUNT} images to a post`,
          );
        }
        files.map((file) => {
          post.images.push(`${POST_IMAGE_PATH}/${file.filename}`);
        });
        await post.save();
        postUpdatedFlag = true;

        return {
          message: 'Images added to post successfully',
          post,
        };
      } else {
        throw new BadRequestException('Please upload images to add');
      }
    } catch (error) {
      //delete files if post not successfully updated
      if (!postUpdatedFlag && files && files.length) {
        files.map((file) => {
          removeFile(`public/${POST_IMAGE_PATH}/${file.filename}`);
        });
      }
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      } else {
        console.log('Error while adding images to post : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while editing post',
        );
      }
    }
  }

  async deleteImages(
    userId: mongoose.Types.ObjectId | string,
    postId: mongoose.Types.ObjectId | string,
    deleteImagesDto: DeletePostImagesDto,
  ) {
    const { images } = deleteImagesDto;
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.user._id.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'User is not authorized to edit this post',
        );
      }

      images.map((image) => {
        const imageIndex = post.images.findIndex(
          (postImage) => postImage === image,
        );
        if (imageIndex !== -1) {
          removeFile(`public/${post.images[imageIndex]}`);
          post.images.splice(imageIndex, 1);
        }
      });

      await post.save();

      return { message: 'Images removed successfully', post };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.log('Error while deleting post images : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while editing post',
        );
      }
    }
  }

  async delete(
    userId: mongoose.Types.ObjectId | string,
    postId: mongoose.Types.ObjectId | string,
  ) {
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      if (post.user._id.toString() !== userId.toString()) {
        throw new ForbiddenException('User not authorized to delete this post');
      }

      if (post.images.length) {
        post.images.map((postImage) => {
          removeFile(`public/${postImage}`);
        });
      }

      await this.postModel.findByIdAndDelete(postId);

      return { message: 'Post deleted successfully', deletedPost: post };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.log('Error while deleting post : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while deleting post',
        );
      }
    }
  }
}

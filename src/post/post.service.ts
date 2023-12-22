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
import {
  MAX_IMAGES_COUNT,
  POST_IMAGE_PATH,
} from 'utils/post-images-upload.config';
import removeFile from 'utils/remove-file';
import { DeletePostImagesDto } from './dtos/delete-postImage.dto';
import { UserService } from 'src/user/user.service';
import { PaginationQueryDto } from 'src/common/dtos/paginationQuery.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private postModel: mongoose.Model<Post>,
    private userService: UserService,
  ) {}

  async getAll(paginationQueryDto: PaginationQueryDto) {
    const { page, limit } = paginationQueryDto;
    try {
      const posts = await this.postModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1,
                  image: 1,
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
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]);

      const totalPosts = await this.postModel.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);
      return {
        posts,
        totalPosts,
        page,
        limit,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      };
    } catch (error) {
      console.log('Error while fetching all posts : ', error);
      throw new InternalServerErrorException(
        'Something went wrong while fetching posts',
      );
    }
  }

  async findByUser(
    userId: mongoose.Types.ObjectId | string,
    paginationQueryDto: PaginationQueryDto,
  ) {
    try {
      const { page, limit } = paginationQueryDto;
      const existingUser = await this.userService.findById(userId);
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const userPosts = await this.postModel.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1,
                  image: 1,
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
          $lookup: {
            from: 'postlikes',
            localField: '_id',
            foreignField: 'post',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  foreignField: '_id',
                  localField: 'user',
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
            ],
            as: 'likes ',
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]);

      const totalPosts = await this.postModel.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);
      return {
        userPosts,
        totalPosts,
        page,
        limit,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while fetching user posts : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while fetching posts',
        );
      }
    }
  }

  async getById(postId: mongoose.Types.ObjectId | string) {
    const post = await this.postModel.findById(postId);
    return post;
  }

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

      post.content = editPostDto.content;
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

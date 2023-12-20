import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { CreatePostDto } from './dtos/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import { UserService } from 'src/user/user.service';

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
  ) {
    try {
      const { content } = createPostDto;
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('User does not exist');
      }
      const newPost = await this.postModel.create({
        user: new mongoose.Types.ObjectId(userId),
        content,
      });

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

  async editPost(
    userId: mongoose.Types.ObjectId | string,
    postId: mongoose.Types.ObjectId | string,
    editPostDto: CreatePostDto,
  ) {
    try {
      const existingUser = await this.userService.findById(userId);
      if (!existingUser) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      const post = await this.postModel.findById(postId);
      if (!post) {
        throw new NotFoundException(`Post with id ${postId} not found`);
      }

      const { content } = editPostDto;
      post.content = content;
      await post.save();

      return { message: 'Post updated successfully', post };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while editing post : ', error);
        throw new InternalServerErrorException('Something went wrong');
      }
    }
  }
}

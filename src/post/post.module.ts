import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LikeService } from './like.service';
import { CommentService } from './comment.service';
import { PostLikes, PostLikesSchema } from './schemas/postLikes.schema';
import {
  CommentLikes,
  CommentLikesSchema,
} from './schemas/commentLIkes.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostLikes.name, schema: PostLikesSchema },
      { name: CommentLikes.name, schema: CommentLikesSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    UserModule,
    JwtModule,
  ],
  controllers: [PostController],
  providers: [PostService, LikeService, CommentService],
  exports: [PostService, LikeService, CommentService],
})
export class PostModule {}

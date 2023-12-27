import { Module } from '@nestjs/common';
import { LikeController } from './like.controller';
import { LikeService } from '../post/like.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostLikes, PostLikesSchema } from '../post/schemas/postLikes.schema';
import { PostModule } from 'src/post/post.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import {
  CommentLikes,
  CommentLikesSchema,
} from '../post/schemas/commentLIkes.schema';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostLikes.name, schema: PostLikesSchema },
      { name: CommentLikes.name, schema: CommentLikesSchema },
    ]),
    PostModule,
    CommentModule,
    JwtModule,
    UserModule,
  ],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}

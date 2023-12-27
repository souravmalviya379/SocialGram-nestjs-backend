import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from '../post/comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../post/schemas/comment.schema';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UserModule,
    JwtModule,
    PostModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}

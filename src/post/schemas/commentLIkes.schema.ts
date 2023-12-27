import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CommentDocument } from 'src/post/schemas/comment.schema';
import { UserDocument } from 'src/user/schemas/user.schema';

export type CommentLikesDocument = HydratedDocument<CommentLikes>;

@Schema({ timestamps: true })
export class CommentLikes {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: UserDocument;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  })
  comment: CommentDocument;
}

export const CommentLikesSchema = SchemaFactory.createForClass(CommentLikes);

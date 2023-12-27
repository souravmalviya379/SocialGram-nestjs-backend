import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CommentIdDto {
  @IsNotEmpty()
  @IsMongoId()
  commentId: string;
}

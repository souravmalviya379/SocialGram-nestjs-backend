import { IsMongoId, IsNotEmpty } from 'class-validator';

export class PostIdDto {
  @IsNotEmpty()
  @IsMongoId()
  postId: string;
}

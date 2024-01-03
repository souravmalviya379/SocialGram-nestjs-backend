import { Transform } from 'class-transformer';
import { IsNotEmpty, Length } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @Length(8, 200)
  @Transform(({ value }) => value.trim())
  content: string;
}

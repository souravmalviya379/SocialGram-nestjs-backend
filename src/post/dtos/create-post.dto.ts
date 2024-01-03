import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(8)
  @Transform(({ value }) => value.trim())
  content: string;
}

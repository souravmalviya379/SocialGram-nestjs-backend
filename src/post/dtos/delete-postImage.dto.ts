import { ArrayNotEmpty, ArrayUnique, IsArray, IsString } from 'class-validator';

export class DeletePostImagesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  images: string[];
}

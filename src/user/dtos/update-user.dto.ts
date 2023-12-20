import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Gender } from '../schemas/user.schema';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 24)
  name: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  country: string;

  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;
}

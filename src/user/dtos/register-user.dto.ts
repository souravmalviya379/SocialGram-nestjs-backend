import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

import { Gender } from '../schemas/user.schema';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsEmail()
  @Transform(({ value }) => value.trim())
  email: string;

  @IsString()
  @Length(3, 20)
  @Transform(({ value }) => value.trim())
  username: string;

  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  country: string;

  @IsEnum(Gender)
  gender: Gender;

  @Length(6, 24)
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  password: string;

  @IsNotEmpty()
  @Length(6, 24)
  @Transform(({ value }) => value.trim())
  confirmPassword: string;
}

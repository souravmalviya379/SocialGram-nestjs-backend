import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
  Validate,
} from 'class-validator';

import { Gender } from '../schemas/user.schema';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 20)
  username: string;

  @IsOptional()
  @IsNotEmpty()
  country: string;

  @IsEnum(Gender)
  gender: Gender;

  @Length(6, 24)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @Length(6, 24)
  confirmPassword: string;
}

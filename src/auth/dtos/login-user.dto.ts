import { Transform } from 'class-transformer';
import { IsNotEmpty, Length, Matches } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @Length(6, 24)
  @Transform(({ value }) => value.trim())
  @Matches(/^\S*$/, { message: 'username must not contain whitespaces' })
  username: string;

  @IsNotEmpty()
  @Length(6, 24)
  @Transform(({ value }) => value.trim())
  password: string;
}

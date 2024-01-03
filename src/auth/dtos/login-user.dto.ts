import { Transform } from 'class-transformer';
import { IsNotEmpty, Length } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @Length(6, 24)
  @Transform(({ value }) => value.trim())
  username: string;

  @IsNotEmpty()
  @Length(6, 24)
  @Transform(({ value }) => value.trim())
  password: string;
}

import { IsNotEmpty, Length } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @Length(3, 24)
  username: string;

  @IsNotEmpty()
  @Length(6, 24)
  password: string;
}

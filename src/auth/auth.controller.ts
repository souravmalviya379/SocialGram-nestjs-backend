import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
    return this.authService.signIn(username, password);
  }
}

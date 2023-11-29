import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto): object {
    return this.userService.create(registerUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}

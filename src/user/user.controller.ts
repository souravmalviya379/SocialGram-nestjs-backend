import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UpdateUserDto } from './dtos/update-user.dto';
import { userImageUploadOptions } from 'utils/user-image-upload.config';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('image', userImageUploadOptions))
  registerUser(
    @Body() registerUserDto: RegisterUserDto,
    @UploadedFile()
    file: Express.Multer.File,
  ): object {
    return this.userService.create(registerUserDto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', userImageUploadOptions))
  @Patch('update-profile')
  async updateProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.edit(req.user, updateUserDto, file);
  }
}

import {
  Controller,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  @Post('create')
  @UseInterceptors(FileInterceptor('images'))
  createPost(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req,
  ) {
    // console.log(req.user);
    console.log(req.file);
    return;
  }
}

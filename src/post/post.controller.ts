import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import {
  MAX_IMAGES_COUNT,
  postImageUploadOptions,
} from 'utils/post-images-upload.config';
import { PostIdDto } from '../common/dtos/postId.dto';
import { DeletePostImagesDto } from './dtos/delete-postImage.dto';
import { UserIdDto } from 'src/common/dtos/userId.dto';
import { PaginationQueryDto } from 'src/common/dtos/paginationQuery.dto';

@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('images', MAX_IMAGES_COUNT, postImageUploadOptions),
  )
  createPost(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Request() req,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.create(req.user._id, createPostDto, files);
  }

  @Get('posts')
  getAllPosts(@Query() paginationQueryDto: PaginationQueryDto) {
    return this.postService.getAll(paginationQueryDto);
  }

  @Get('my')
  getMyPosts(@Request() req, @Query() paginationQueryDto: PaginationQueryDto) {
    return this.postService.findByUser(req.user._id, paginationQueryDto);
  }

  @Get('user/:userId')
  getUserPosts(
    @Param() userIdDto: UserIdDto,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const { userId } = userIdDto;
    return this.postService.findByUser(userId, paginationQueryDto);
  }

  @Get('/:postId')
  getPostById(@Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    return this.postService.getById(postId);
  }

  @Patch('edit-content/:postId')
  editPostContent(
    @Request() req,
    @Param() postIdDto: PostIdDto,
    @Body() editContentDto: CreatePostDto,
  ) {
    const { postId } = postIdDto;
    return this.postService.editPostContent(
      req.user._id,
      postId,
      editContentDto,
    );
  }

  @Patch('add-images/:postId')
  @UseInterceptors(
    FilesInterceptor('images', MAX_IMAGES_COUNT, postImageUploadOptions),
  )
  addPostImages(
    @Request() req,
    @Param() postIdDto: PostIdDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const { postId } = postIdDto;
    return this.postService.addImages(req.user._id, postId, files);
  }

  @Patch('delete-images/:postId')
  deletePostImages(
    @Request() req,
    @Param() postIdDto: PostIdDto,
    @Body() deleteImageDto: DeletePostImagesDto,
  ) {
    const { postId } = postIdDto;
    return this.postService.deleteImages(req.user._id, postId, deleteImageDto);
  }

  @Delete('/:postId')
  deletePost(@Request() req, @Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    return this.postService.delete(req.user._id, postId);
  }
}

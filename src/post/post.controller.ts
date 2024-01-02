import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { PostIdDto } from './dtos/postId.dto';
import { DeletePostImagesDto } from './dtos/delete-postImage.dto';
import { UserIdDto } from 'src/common/dtos/userId.dto';
import { PaginationQueryDto } from 'src/common/dtos/paginationQuery.dto';
import { LikeService } from './like.service';
import { CommentService } from './comment.service';
import { CommentIdDto } from './dtos/commentId.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';

@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(
    private postService: PostService,
    private likeService: LikeService,
    private commentService: CommentService,
  ) {}

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

  @Post('comment/:commentId/like')
  async likeComment(@Request() req, @Param() commentIdDto: CommentIdDto) {
    const { commentId } = commentIdDto;
    return this.likeService.likeComment(req.user._id, commentId);
  }

  @Post('comment/:commentId/reply')
  replyComment(
    @Request() req,
    @Param() commentIdDto: CommentIdDto,
    @Body() createReplyDto: CreateCommentDto,
  ) {
    const { commentId } = commentIdDto;
    return this.commentService.createReply(
      req.user._id,
      commentId,
      createReplyDto,
    );
  }

  @Post('/:postId/like')
  likePost(@Request() req, @Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    return this.likeService.likePost(req.user._id, postId);
  }

  @Post('/:postId/comment')
  createComment(
    @Request() req,
    @Param() postIdDto: PostIdDto,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { postId } = postIdDto;
    return this.commentService.create(req.user._id, postId, createCommentDto);
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
  @Get('comment/:commentId/likes')
  async getCommentLikes(
    @Param() commentIdDto: CommentIdDto,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const { commentId } = commentIdDto;
    return this.likeService.getCommentLikes(commentId, paginationQueryDto);
  }

  @Get('comment/:commentId/likes-count')
  async getCommentLikesCount(@Param() commentIdDto: CommentIdDto) {
    const { commentId } = commentIdDto;
    const likesCount = await this.likeService.getCommentLikesCount(commentId);
    return { likesCount };
  }

  @Get('comment/:commentId/replies')
  fetchCommentReplies(@Request() req, @Param() commentIdDto: CommentIdDto) {
    const { commentId } = commentIdDto;
    return this.commentService.getCommentReplies(commentId);
  }

  @Get('/:postId')
  async getPostById(@Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    return this.postService.getById(postId);
  }

  @Get('/:postId/likes')
  getPostLikes(
    @Request() req,
    @Param() postIdDto: PostIdDto,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const { postId } = postIdDto;
    return this.likeService.getPostLikes(postId, paginationQueryDto);
  }

  @Get('/:postId/likes-count')
  async getPostLikesCount(@Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    const likesCount = await this.likeService.getPostLikesCount(postId);
    return { postLikesCount: likesCount };
  }

  @Get('/:postId/comments')
  fetchPostComments(@Request() req, @Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    return this.commentService.getPostComments(postId);
  }

  @Patch('comment/:commentId')
  editComment(
    @Request() req,
    @Param() commentIdDto: CommentIdDto,
    @Body() editCommentDto: CreateCommentDto,
  ) {
    const { commentId } = commentIdDto;
    return this.commentService.edit(req.user._id, commentId, editCommentDto);
  }

  @Patch('/:postId/edit-content')
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

  @Patch('/:postId/add-images')
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

  @Patch('/:postId/delete-images')
  deletePostImages(
    @Request() req,
    @Param() postIdDto: PostIdDto,
    @Body() deleteImageDto: DeletePostImagesDto,
  ) {
    const { postId } = postIdDto;
    return this.postService.deleteImages(req.user._id, postId, deleteImageDto);
  }

  @Delete('comment/:commentId')
  deleteComment(@Request() req, @Param() commentIdDto: CommentIdDto) {
    return this.commentService.delete(req.user._id, commentIdDto);
  }

  @Delete('/:postId')
  deletePost(@Request() req, @Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    return this.postService.delete(req.user._id, postId);
  }
}

import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostIdDto } from 'src/common/dtos/postId.dto';
import { LikeService } from './like.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { PaginationQueryDto } from 'src/common/dtos/paginationQuery.dto';
import { CommentIdDto } from 'src/common/dtos/commentId.dto';

@Controller('like')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Post('post/:postId')
  likePost(@Request() req, @Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    return this.likeService.likePost(req.user._id, postId);
  }

  @Get('post/:postId')
  getPostLikes(
    @Request() req,
    @Param() postIdDto: PostIdDto,
    @Query() paginationQueryDto: PaginationQueryDto,
  ) {
    const { postId } = postIdDto;
    return this.likeService.getPostLikes(postId, paginationQueryDto);
  }

  @Get('post/:postId/likes-count')
  async getPostLikesCount(@Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    const likesCount = await this.likeService.getPostLikesCount(postId);
    return { postLikesCount: likesCount };
  }

  @Post('comment/:commentId')
  async likeComment(@Request() req, @Param() commentIdDto: CommentIdDto) {
    const { commentId } = commentIdDto;
    return this.likeService.likeComment(req.user._id, commentId);
  }

  @Get('comment/:commentId')
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
}

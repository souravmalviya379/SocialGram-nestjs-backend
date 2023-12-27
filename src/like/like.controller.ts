import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LikeService } from '../post/like.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { PaginationQueryDto } from 'src/common/dtos/paginationQuery.dto';
import { PostIdDto } from 'src/post/dtos/postId.dto';
import { CommentIdDto } from 'src/post/dtos/commentId.dto';

@Controller('like')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private likeService: LikeService) {}

  

  

  

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

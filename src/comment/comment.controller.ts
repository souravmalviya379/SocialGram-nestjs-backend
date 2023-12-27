import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from '../post/comment.service';
import { PostIdDto } from 'src/common/dtos/postId.dto';
import { CreateCommentDto } from '../post/dtos/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { CommentIdDto } from 'src/common/dtos/commentId.dto';

@UseGuards(JwtAuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post('post/:postId')
  createComment(
    @Request() req,
    @Param() postIdDto: PostIdDto,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { postId } = postIdDto;
    return this.commentService.create(req.user._id, postId, createCommentDto);
  }

  @Post('/:commentId/reply')
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

  @Get('post-comments/:postId')
  fetchPostComments(@Request() req, @Param() postIdDto: PostIdDto) {
    const { postId } = postIdDto;
    return this.commentService.getPostComments(postId);
  }

  @Get('/:commentId/replies')
  fetchCommentReplies(@Request() req, @Param() commentIdDto: CommentIdDto) {
    const { commentId } = commentIdDto;
    return this.commentService.getCommentReplies(commentId);
  }

  @Patch('/:commentId')
  editComment(
    @Request() req,
    @Param() commentIdDto: CommentIdDto,
    @Body() editCommentDto: CreateCommentDto,
  ) {
    const { commentId } = commentIdDto;
    return this.commentService.edit(req.user._id, commentId, editCommentDto);
  }

  @Delete('/:commentId')
  deleteComment(@Request() req, @Param() commentIdDto: CommentIdDto) {
    return this.commentService.delete(req.user._id, commentIdDto);
  }
}

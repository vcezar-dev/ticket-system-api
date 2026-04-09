import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateComment,
  ApiDeleteComment,
  ApiFindAllComments,
} from './decorators/api-comments.decorator';

@ApiBearerAuth()
@ApiTags('comments')
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiCreateComment()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() createCommentDto: CreateCommentDto,
    @ActiveUser() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.commentsService.create(
      ticketId,
      createCommentDto,
      tokenPayloadDto,
    );
  }

  @ApiFindAllComments()
  @Get()
  findAll(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @ActiveUser() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.commentsService.findAll(ticketId, tokenPayloadDto);
  }

  @ApiDeleteComment()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.commentsService.delete(ticketId, id, tokenPayloadDto);
  }
}

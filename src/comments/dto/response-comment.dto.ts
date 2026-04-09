import { ResponseUserSummaryDto } from '../../common/dto/response-user-summary.dto';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Comment } from '../entities/comment.entity';

export class ResponseTicketSummaryDto {
  id!: string;
  title!: string;

  constructor(ticket: Ticket) {
    this.id = ticket.id;
    this.title = ticket.title;
  }
}

export class ResponseCommentDto {
  id!: string;
  content!: string;
  ticket!: ResponseTicketSummaryDto;
  author!: ResponseUserSummaryDto | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.ticket = new ResponseTicketSummaryDto(comment.ticket);
    this.author = comment.author
      ? new ResponseUserSummaryDto(comment.author)
      : null;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}

import { User } from '../../users/entities/user.entity';
import { Ticket } from '../entities/ticket.entity';
import { Category } from '../enums/category.enum';
import { Priority } from '../enums/priority.enum';
import { Status } from '../enums/status.enum';

export class ResponseUserSummaryDto {
  id!: string;
  name!: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
  }
}

export class ResponseTicketDto {
  id!: string;
  title!: string;
  description!: string;
  status!: Status;
  priority!: Priority;
  category!: Category;
  createdBy!: ResponseUserSummaryDto | null;
  assignedTo!: ResponseUserSummaryDto | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(ticket: Ticket) {
    this.id = ticket.id;
    this.title = ticket.title;
    this.description = ticket.description;
    this.status = ticket.status;
    this.priority = ticket.priority;
    this.category = ticket.category;
    this.createdBy = ticket.createdBy
      ? new ResponseUserSummaryDto(ticket.createdBy)
      : null;
    this.assignedTo = ticket.assignedTo
      ? new ResponseUserSummaryDto(ticket.assignedTo)
      : null;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
  }
}

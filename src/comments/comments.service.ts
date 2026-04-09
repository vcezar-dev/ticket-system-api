import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { TicketsService } from '../tickets/tickets.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { Ticket } from '../tickets/entities/ticket.entity';
import { ResponseCommentDto } from './dto/response-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly ticketsService: TicketsService,
    private readonly usersService: UsersService,
  ) {}
  private checkTicketAccess(ticket: Ticket, tokenPayloadDto: TokenPayloadDto) {
    if (
      tokenPayloadDto.sub !== ticket.createdBy?.id &&
      tokenPayloadDto.role !== Role.Admin &&
      tokenPayloadDto.role !== Role.Agent
    ) {
      throw new ForbiddenException();
    }
  }

  async create(
    ticketId: string,
    createCommentDto: CreateCommentDto,
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<ResponseCommentDto> {
    const ticket = await this.ticketsService.findOneEntity(ticketId);

    this.checkTicketAccess(ticket, tokenPayloadDto);

    const user = await this.usersService.findOneEntity(tokenPayloadDto.sub);

    // TODO: restrict comments to ticket owner, assigned agent and observers when observer feature is implemented

    const comment = this.commentRepository.create({
      ...createCommentDto,
      ticket,
      author: user,
    });

    await this.commentRepository.save(comment);

    return new ResponseCommentDto(comment);
  }

  async findAll(
    ticketId: string,
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<ResponseCommentDto[]> {
    const ticket = await this.ticketsService.findOneEntity(ticketId);

    this.checkTicketAccess(ticket, tokenPayloadDto);

    const comments = await this.commentRepository.find({
      where: { ticket: { id: ticketId } },
      relations: ['author', 'ticket'],
    });

    return comments.map((comment) => new ResponseCommentDto(comment));
  }

  async delete(
    ticketId: string,
    id: string,
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<void> {
    const ticket = await this.ticketsService.findOneEntity(ticketId);

    this.checkTicketAccess(ticket, tokenPayloadDto);

    const comment = await this.commentRepository.findOne({
      where: { id, ticket: { id: ticketId } },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.commentRepository.remove(comment);
  }
}

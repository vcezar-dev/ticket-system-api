import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { Status } from './enums/status.enum';
import { ResponseTicketDto } from './dto/response-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly usersService: UsersService,
  ) {}
  async findOneEntity(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!ticket) {
      throw new NotFoundException('ticket not found');
    }

    return ticket;
  }

  async create(
    createTicketDto: CreateTicketDto,
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<ResponseTicketDto> {
    const user = await this.usersService.findOneEntity(tokenPayloadDto.sub);

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      createdBy: user,
    });

    await this.ticketRepository.save(ticket);

    return new ResponseTicketDto(ticket);
  }

  async findAll(
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<ResponseTicketDto[]> {
    if (tokenPayloadDto.role === Role.User) {
      const tickets = await this.ticketRepository.find({
        where: { createdBy: { id: tokenPayloadDto.sub } },
        relations: ['createdBy'],
      });

      return tickets.map((ticket) => new ResponseTicketDto(ticket));
    }

    const tickets = await this.ticketRepository.find({
      relations: ['createdBy'],
    });

    return tickets.map((ticket) => new ResponseTicketDto(ticket));
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
  ): Promise<ResponseTicketDto> {
    const ticket = await this.findOneEntity(id);

    if (
      ticket?.status === Status.Closed ||
      ticket?.status === Status.Resolved
    ) {
      throw new ConflictException('ticket already closed or resolved');
    }

    if (updateStatusDto.assignedTo) {
      const assignedUser = await this.usersService.findOneEntity(
        updateStatusDto.assignedTo,
      );
      ticket.assignedTo = assignedUser;
    }

    const { assignedTo: _, ...rest } = updateStatusDto;
    Object.assign(ticket, rest);

    await this.ticketRepository.save(ticket);

    return new ResponseTicketDto(ticket);
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    tokenPayloadDto: TokenPayloadDto,
  ): Promise<ResponseTicketDto> {
    const ticket = await this.findOneEntity(id);

    if (
      tokenPayloadDto.sub !== ticket.createdBy?.id &&
      tokenPayloadDto.role !== Role.Admin &&
      tokenPayloadDto.role !== Role.Agent
    ) {
      throw new ForbiddenException();
    }

    Object.assign(ticket, updateTicketDto);

    await this.ticketRepository.save(ticket);

    return new ResponseTicketDto(ticket);
  }

  async delete(id: string): Promise<void> {
    const ticket = await this.findOneEntity(id);

    await this.ticketRepository.remove(ticket);
  }
}

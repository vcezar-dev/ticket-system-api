import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { TicketsService } from './tickets.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateTicket,
  ApiDeleteTicket,
  ApiFindAllTickets,
  ApiUpdateTicket,
  ApiUpdateTicketStatus,
} from './decorators/api-tickets.decorator';

@ApiBearerAuth()
@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiCreateTicket()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTicketDto: CreateTicketDto,
    @ActiveUser() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.ticketsService.create(createTicketDto, tokenPayloadDto);
  }

  @ApiFindAllTickets()
  @Get()
  findAll(@ActiveUser() tokenPayloadDto: TokenPayloadDto) {
    return this.ticketsService.findAll(tokenPayloadDto);
  }

  @ApiUpdateTicket()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @ActiveUser() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.ticketsService.update(id, updateTicketDto, tokenPayloadDto);
  }

  @ApiUpdateTicketStatus()
  @Roles(Role.Admin, Role.Agent)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.ticketsService.updateStatus(id, updateStatusDto);
  }

  @ApiDeleteTicket()
  @Roles(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.delete(id);
  }
}

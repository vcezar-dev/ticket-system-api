import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { UsersService } from '../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockUser } from '../test/factories/user.factory';
import { createMockTokenPayload } from '../test/factories/auth.factory';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Category } from './enums/category.enum';
import { Priority } from './enums/priority.enum';
import { ResponseTicketDto } from './dto/response-ticket.dto';
import { createMockTicket } from '../test/factories/ticket.factory';
import { TEST_UUID } from '../test/constants/test.constants';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../users/enums/role.enum';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Status } from './enums/status.enum';
import { UpdateTicketDto } from './dto/update-ticket.dto';

describe('TicketsService', () => {
  let ticketsService: TicketsService;
  let ticketRepository: Repository<Ticket>;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneEntity: jest.fn(),
          },
        },
      ],
    }).compile();

    ticketsService = module.get(TicketsService);
    ticketRepository = module.get(getRepositoryToken(Ticket));
    usersService = module.get(UsersService);
  });

  it('TicketService should be defined', () => {
    expect(ticketsService).toBeDefined();
  });

  describe('create', () => {
    it('should create a ticket for a user', async () => {
      const mockCreateTicketDto: CreateTicketDto = {
        title: 'ticket-title',
        description: 'Description of the ticket',
        category: Category.Support,
        priority: Priority.Low,
      };

      const mockTokenPayloadDto = createMockTokenPayload();

      const mockUser = createMockUser();

      const mockTicket = createMockTicket(mockCreateTicketDto, mockUser);

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);
      jest.spyOn(ticketRepository, 'create').mockReturnValue(mockTicket);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue(mockTicket);

      const result = await ticketsService.create(
        mockCreateTicketDto,
        mockTokenPayloadDto,
      );

      expect(usersService.findOneEntity).toHaveBeenCalledWith(
        mockTokenPayloadDto.sub,
      );
      expect(ticketRepository.create).toHaveBeenCalledWith({
        ...mockCreateTicketDto,
        createdBy: mockUser,
      });
      expect(ticketRepository.save).toHaveBeenCalledWith(mockTicket);
      expect(result).toEqual(new ResponseTicketDto(mockTicket));
    });
  });

  describe('findOneEntity', () => {
    it('should return a ticket entity', async () => {
      const mockTicket = createMockTicket({ id: TEST_UUID });

      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(mockTicket);

      const result = await ticketsService.findOneEntity(TEST_UUID);

      expect(ticketRepository.findOne).toHaveBeenCalledWith({
        where: { id: TEST_UUID },
        relations: ['createdBy'],
      });
      expect(result).toBe(mockTicket);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(null);

      await expect(ticketsService.findOneEntity(TEST_UUID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all tickets from user', async () => {
      const mockTokenPayloadDto = createMockTokenPayload();

      const mockTickets = [createMockTicket()];

      jest.spyOn(ticketRepository, 'find').mockResolvedValue(mockTickets);

      const result = await ticketsService.findAll(mockTokenPayloadDto);

      expect(ticketRepository.find).toHaveBeenCalledWith({
        relations: ['createdBy'],
        where: { createdBy: { id: mockTokenPayloadDto.sub } },
      });
      expect(result).toEqual(
        mockTickets.map((ticket) => new ResponseTicketDto(ticket)),
      );
    });

    it('should return all tickets when user has role admin or agent', async () => {
      const mockTokenPayloadDto = createMockTokenPayload({ role: Role.Admin });

      const mockTickets = [createMockTicket()];

      jest.spyOn(ticketRepository, 'find').mockResolvedValue(mockTickets);

      const result = await ticketsService.findAll(mockTokenPayloadDto);

      expect(ticketRepository.find).toHaveBeenCalledWith({
        relations: ['createdBy'],
      });
      expect(result).toEqual(
        mockTickets.map((ticket) => new ResponseTicketDto(ticket)),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update ticket status', async () => {
      const mockUpdateStatusDto: UpdateStatusDto = {
        status: Status.In_progress,
      };

      const mockTicket = createMockTicket({ id: TEST_UUID });

      const mockTicketUpdated = {
        ...mockTicket,
        ...mockUpdateStatusDto,
      } as Ticket;

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue(mockTicket);

      const result = await ticketsService.updateStatus(
        TEST_UUID,
        mockUpdateStatusDto,
      );

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(ticketRepository.save).toHaveBeenCalledWith(mockTicketUpdated);
      expect(result).toEqual(new ResponseTicketDto(mockTicketUpdated));
    });

    it('should throw ConflictException when ticket already closed or resolved', async () => {
      const mockUpdateStatusDto = {
        status: Status.In_progress,
      } as UpdateStatusDto;

      const mockTicket = createMockTicket({
        id: TEST_UUID,
        status: Status.Closed,
      });

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);

      await expect(
        ticketsService.updateStatus(TEST_UUID, mockUpdateStatusDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should update ticket.assignedTo when this exists', async () => {
      const mockUpdateStatusDto: UpdateStatusDto = {
        status: Status.In_progress,
        assignedTo: TEST_UUID,
      };

      const mockTicket = createMockTicket({ id: TEST_UUID });

      const mockUser = createMockUser({ id: TEST_UUID });

      const mockTicketUpdated = {
        ...mockTicket,
        status: mockUpdateStatusDto.status,
        assignedTo: mockUser,
      };

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue(mockTicket);

      const result = await ticketsService.updateStatus(
        TEST_UUID,
        mockUpdateStatusDto,
      );

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(ticketRepository.save).toHaveBeenCalledWith(mockTicketUpdated);
      expect(result).toEqual(new ResponseTicketDto(mockTicketUpdated));
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const mockUpdateTicketDto: UpdateTicketDto = {
        title: 'ticket-test-title',
        description: 'Description of the ticket test',
        category: Category.Support,
        priority: Priority.Low,
      };

      const mockTokenPayloadDto = createMockTokenPayload();

      const mockTicket = createMockTicket();

      const mockTicketUpdated = {
        ...mockTicket,
        ...mockUpdateTicketDto,
      };

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue(mockTicketUpdated);

      const result = await ticketsService.update(
        TEST_UUID,
        mockUpdateTicketDto,
        mockTokenPayloadDto,
      );

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(ticketRepository.save).toHaveBeenCalledWith(mockTicketUpdated);
      expect(result).toEqual(new ResponseTicketDto(mockTicketUpdated));
    });

    it('should throw ForbiddenException when user is not the owner or has role Admin/Agent', async () => {
      const mockUpdateTicketDto: UpdateTicketDto = {};

      const mockTokenPayloadDto = createMockTokenPayload({
        sub: 'other-uuid',
        role: Role.User,
      });

      const mockTicket = createMockTicket();

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);

      await expect(
        ticketsService.update(
          TEST_UUID,
          mockUpdateTicketDto,
          mockTokenPayloadDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin/agent to update a ticket even if they are not the owner', async () => {
      const mockUpdateTicketDto: UpdateTicketDto = {};

      const mockTokenPayloadDto = createMockTokenPayload({
        sub: 'other-uuid',
        role: Role.Admin,
      });

      const mockTicket = createMockTicket();

      const mockTicketUpdated = {
        ...mockTicket,
        ...mockUpdateTicketDto,
      };

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(ticketRepository, 'save').mockResolvedValue(mockTicketUpdated);

      const result = await ticketsService.update(
        TEST_UUID,
        mockUpdateTicketDto,
        mockTokenPayloadDto,
      );

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(ticketRepository.save).toHaveBeenCalledWith(mockTicketUpdated);
      expect(result).toEqual(new ResponseTicketDto(mockTicketUpdated));
    });
  });

  describe('delete', () => {
    it('should delete a ticket', async () => {
      const mockTicket = createMockTicket({ id: TEST_UUID });

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(ticketRepository, 'remove').mockResolvedValue(mockTicket);

      const result = await ticketsService.delete(TEST_UUID);

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(ticketRepository.remove).toHaveBeenCalledWith(mockTicket);
      expect(result).toBeUndefined();
    });
  });
});

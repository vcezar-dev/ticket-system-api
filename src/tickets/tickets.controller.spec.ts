import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { TEST_UUID } from '../test/constants/test.constants';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ResponseTicketDto } from './dto/response-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsController } from './tickets.controller';

describe('TicketsController', () => {
  let controller: TicketsController;
  const ticketsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TicketsController(ticketsServiceMock as any);
  });

  it('TicketsController should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct arguments', async () => {
    const mockCreateTicketDto = {} as CreateTicketDto;
    const mockTokenPayload = {} as TokenPayloadDto;
    const mockResponse = {} as ResponseTicketDto;

    jest.spyOn(ticketsServiceMock, 'create').mockResolvedValue(mockResponse);

    const result = await controller.create(
      mockCreateTicketDto,
      mockTokenPayload,
    );

    expect(ticketsServiceMock.create).toHaveBeenCalledWith(
      mockCreateTicketDto,
      mockTokenPayload,
    );
    expect(result).toBe(mockResponse);
  });

  it('should call findAll with correct arguments', async () => {
    const mockTokenPayload = {} as TokenPayloadDto;
    const mockResponse = [] as ResponseTicketDto[];

    jest.spyOn(ticketsServiceMock, 'findAll').mockResolvedValue(mockResponse);

    const result = await controller.findAll(mockTokenPayload);

    expect(ticketsServiceMock.findAll).toHaveBeenCalledWith(mockTokenPayload);
    expect(result).toBe(mockResponse);
  });

  it('should call update with correct arguments', async () => {
    const mockUpdateTicketDto = {} as UpdateTicketDto;
    const mockTokenPayload = {} as TokenPayloadDto;
    const mockResponse = {} as ResponseTicketDto;

    jest.spyOn(ticketsServiceMock, 'update').mockResolvedValue(mockResponse);

    const result = await controller.update(
      TEST_UUID,
      mockUpdateTicketDto,
      mockTokenPayload,
    );

    expect(ticketsServiceMock.update).toHaveBeenCalledWith(
      TEST_UUID,
      mockUpdateTicketDto,
      mockTokenPayload,
    );
    expect(result).toBe(mockResponse);
  });

  it('should call updateStatus with correct arguments', async () => {
    const mockUpdateStatusDto = {} as UpdateStatusDto;
    const mockResponse = {} as ResponseTicketDto;

    jest
      .spyOn(ticketsServiceMock, 'updateStatus')
      .mockResolvedValue(mockResponse);

    const result = await controller.updateStatus(
      TEST_UUID,
      mockUpdateStatusDto,
    );

    expect(ticketsServiceMock.updateStatus).toHaveBeenCalledWith(
      TEST_UUID,
      mockUpdateStatusDto,
    );
    expect(result).toBe(mockResponse);
  });

  it('should call delete with correct arguments', async () => {
    jest.spyOn(ticketsServiceMock, 'delete').mockResolvedValue(undefined);

    const result = await controller.delete(TEST_UUID);

    expect(ticketsServiceMock.delete).toHaveBeenCalledWith(TEST_UUID);
    expect(result).toBeUndefined();
  });
});

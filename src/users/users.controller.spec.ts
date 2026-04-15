import { TEST_UUID } from '../test/constants/test.constants';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  const usersServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(usersServiceMock as any);
  });

  it('UsersController should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct arguments', async () => {
    const mockCreateUserDto = {} as CreateUserDto;
    const mockResponse = {} as ResponseUserDto;

    jest.spyOn(usersServiceMock, 'create').mockResolvedValue(mockResponse);

    const result = await controller.create(mockCreateUserDto);

    expect(usersServiceMock.create).toHaveBeenCalledWith(mockCreateUserDto);
    expect(result).toBe(mockResponse);
  });

  it('should call findAll with correct arguments', async () => {
    const mockResponse = [] as ResponseUserDto[];

    jest.spyOn(usersServiceMock, 'findAll').mockResolvedValue(mockResponse);

    const result = await controller.findAll();

    expect(usersServiceMock.findAll).toHaveBeenCalledWith();
    expect(result).toBe(mockResponse);
  });

  it('should call findOne with correct arguments', async () => {
    const mockId = TEST_UUID;
    const mockTokenPayloadDto = {} as TokenPayloadDto;

    const mockResponse = {} as ResponseUserDto;

    jest.spyOn(usersServiceMock, 'findOne').mockResolvedValue(mockResponse);

    const result = await controller.findOne(mockId, mockTokenPayloadDto);

    expect(usersServiceMock.findOne).toHaveBeenCalledWith(
      mockId,
      mockTokenPayloadDto,
    );
    expect(result).toBe(mockResponse);
  });

  it('should call update with the correct arguments', async () => {
    const mockId = TEST_UUID;
    const mockUpdateUserDto = {} as UpdateUserDto;
    const mockTokenPayloadDto = {} as TokenPayloadDto;

    const mockResponse = {} as ResponseUserDto;

    jest.spyOn(usersServiceMock, 'update').mockResolvedValue(mockResponse);

    const result = await controller.update(
      mockId,
      mockUpdateUserDto,
      mockTokenPayloadDto,
    );

    expect(usersServiceMock.update).toHaveBeenCalledWith(
      mockId,
      mockUpdateUserDto,
      mockTokenPayloadDto,
    );

    expect(result).toBe(mockResponse);
  });

  it('should call remove with the correct arguments', async () => {
    const mockId = TEST_UUID;

    const mockResponse = {} as ResponseUserDto;

    jest.spyOn(usersServiceMock, 'remove').mockResolvedValue(mockResponse);

    const result = await controller.remove(mockId);

    expect(usersServiceMock.remove).toHaveBeenCalledWith(mockId);
    expect(result).toBe(mockResponse);
  });
});

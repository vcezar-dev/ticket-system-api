import { AuthController } from './auth.controller';
import { LoginDto } from './dto/login.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const authServiceMock = {
    login: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authServiceMock as any);
  });

  it('AuthController should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call login with correct arguments', async () => {
    const mockLoginDto = {} as LoginDto;
    const mockResponse = {};

    jest.spyOn(authServiceMock, 'login').mockResolvedValue(mockResponse);

    const result = await controller.login(mockLoginDto);

    expect(authServiceMock.login).toHaveBeenCalledWith(mockLoginDto);
    expect(result).toBe(mockResponse);
  });

  it('should call refresh with correct arguments', async () => {
    const mockTokenPayloadDto = {} as TokenPayloadDto;

    const mockResponse = {};

    jest.spyOn(authServiceMock, 'refresh').mockResolvedValue(mockResponse);

    const result = await controller.refresh(mockTokenPayloadDto);

    expect(authServiceMock.refresh).toHaveBeenCalledWith(mockTokenPayloadDto);
    expect(result).toBe(mockResponse);
  });
});

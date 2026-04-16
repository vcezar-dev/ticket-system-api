import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingService } from '../common/hashing/hashing.service';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { createMockUser } from '../test/factories/user.factory';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { TokenPayloadDto } from './dto/token-payload.dto';
import {
  createMockJwtConfig,
  createMockLoginDto,
  createMockTokenPayload,
  createTokenSignArgs,
} from '../test/factories/auth.factory';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtConfiguration: ConfigType<typeof jwtConfig>;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: jwtConfig.KEY,
          useValue: createMockJwtConfig(),
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: { compare: jest.fn() },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    jwtConfiguration = module.get(jwtConfig.KEY);
    jwtService = module.get(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    hashingService = module.get(HashingService);
  });

  it('AuthService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    let mockLoginDto: LoginDto;
    let mockUser: User;

    beforeEach(() => {
      mockLoginDto = createMockLoginDto({
        email: 'usertest@email.com',
        password: 'password-test',
      });

      mockUser = createMockUser({
        email: 'usertest@email.com',
        passwordHash: 'password-test',
      });
    });

    it('should return access and refresh tokens when credentials are valid', async () => {
      const mockTokens = {
        accessToken: 'access_token_jwt',
        refreshToken: 'refresh_token_jwt',
      };

      const { accessTokenArgs, refreshTokenArgs } = createTokenSignArgs(
        mockUser.id,
        mockUser.role,
        jwtConfiguration,
      );

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(hashingService, 'compare').mockResolvedValueOnce(true);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await authService.login(mockLoginDto);

      expect(hashingService.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.passwordHash,
      );

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        ...accessTokenArgs,
      );

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        ...refreshTokenArgs,
      );

      expect(result).toStrictEqual(mockTokens);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    let mockTokenPayloadDto: TokenPayloadDto;
    let mockUser: User;

    beforeEach(() => {
      mockTokenPayloadDto = createMockTokenPayload();

      mockUser = createMockUser();
    });

    it('should refresh the jwt tokens', async () => {
      const mockTokens = {
        accessToken: 'access_token_jwt',
        refreshToken: 'refresh_token_jwt',
      };

      const { accessTokenArgs, refreshTokenArgs } = createTokenSignArgs(
        mockUser.id,
        mockUser.role,
        jwtConfiguration,
      );

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await authService.refresh(mockTokenPayloadDto);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: mockTokenPayloadDto.sub,
      });

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        ...accessTokenArgs,
      );

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        ...refreshTokenArgs,
      );

      expect(result).toStrictEqual(mockTokens);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(authService.refresh(mockTokenPayloadDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

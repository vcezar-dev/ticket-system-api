import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenGuard } from './refresh-token.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import {
  createMockJwtConfig,
  createMockTokenPayload,
} from '../../test/factories/auth.factory';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';

describe('RefreshTokenGuard', () => {
  let refreshTokenGuard: RefreshTokenGuard;
  let jwtService: JwtService;
  let jwtConfiguration: ConfigType<typeof jwtConfig>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: createMockJwtConfig(),
        },
      ],
    }).compile();

    refreshTokenGuard = module.get(RefreshTokenGuard);
    jwtService = module.get(JwtService);
    jwtConfiguration = module.get(jwtConfig.KEY);
  });

  it('RefreshTokenGuard should be defined', () => {
    expect(refreshTokenGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should refresh token jwt', async () => {
      const mockRequestPayload = {
        body: {
          refreshToken: 'valid_refresh_token',
        } as RefreshTokenDto,
      };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequestPayload,
        }),
      } as ExecutionContext;

      const mockTokenPayloadDto = createMockTokenPayload();

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue(mockTokenPayloadDto);

      const result = await refreshTokenGuard.canActivate(mockContext);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid_refresh_token',
        jwtConfiguration,
      );
      expect(mockRequestPayload[REQUEST_TOKEN_PAYLOAD_KEY]).toEqual(
        mockTokenPayloadDto,
      );
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when refresh token is missing', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: {},
          }),
        }),
      } as ExecutionContext;

      await expect(refreshTokenGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: { refreshToken: 'invalid_token' },
          }),
        }),
      } as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

      await expect(refreshTokenGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

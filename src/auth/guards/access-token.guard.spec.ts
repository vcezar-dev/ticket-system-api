import { ConfigType } from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { AccessTokenGuard } from './access-token.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockJwtConfig,
  createMockTokenPayload,
} from '../../test/factories/auth.factory';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';

describe('AccessTokenGuard', () => {
  let accessTokenGuard: AccessTokenGuard;
  let jwtService: JwtService;
  let jwtConfiguration: ConfigType<typeof jwtConfig>;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
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
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    accessTokenGuard = module.get(AccessTokenGuard);
    jwtService = module.get(JwtService);
    jwtConfiguration = module.get(jwtConfig.KEY);
    reflector = module.get(Reflector);
  });

  it('AccessTokenGuard should be defined', () => {
    expect(accessTokenGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should validate token jwt', async () => {
      const mockRequestPayload = {
        headers: {
          authorization: 'bearer token-jwt',
        },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequestPayload,
        }),
        getHandler: () => {},
        getClass: () => {},
      } as ExecutionContext;

      const mockTokenPayloadDto = createMockTokenPayload();

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue(mockTokenPayloadDto);

      const result = await accessTokenGuard.canActivate(mockContext);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'token-jwt',
        jwtConfiguration,
      );
      expect(mockRequestPayload[REQUEST_TOKEN_PAYLOAD_KEY]).toEqual(
        mockTokenPayloadDto,
      );
      expect(result).toBe(true);
    });

    it('should return when route do not need authorization', async () => {
      const mockContext = {
        getHandler: () => {},
        getClass: () => {},
      } as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = await accessTokenGuard.canActivate(mockContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when authorization is missing', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
        getHandler: () => {},
        getClass: () => {},
      } as ExecutionContext;

      await expect(accessTokenGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when access token is invalid', async () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer invalid-jwt-token',
            },
          }),
        }),
        getHandler: () => {},
        getClass: () => {},
      } as ExecutionContext;

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

      await expect(accessTokenGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

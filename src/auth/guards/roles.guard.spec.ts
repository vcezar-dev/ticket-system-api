import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { createMockTokenPayload } from '../../test/factories/auth.factory';
import { Role } from '../../users/enums/role.enum';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('RolesGuard should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should be allow user to access if he has the required role', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_TOKEN_PAYLOAD_KEY]: createMockTokenPayload({
              role: Role.Admin,
            }),
          }),
        }),
        getHandler: () => {},
        getClass: () => {},
      } as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Role.Admin, Role.Agent]);

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should be allow user to access if the route do not has requirements', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_TOKEN_PAYLOAD_KEY]: createMockTokenPayload(),
          }),
        }),
        getHandler: () => {},
        getClass: () => {},
      } as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when authorization is missing', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
        getHandler: () => {},
        getClass: () => {},
      } as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Role.Admin, Role.Agent]);

      expect(() => rolesGuard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw ForbiddenException when user do not has a required role', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            [REQUEST_TOKEN_PAYLOAD_KEY]: createMockTokenPayload(),
          }),
        }),
        getHandler: () => {},
        getClass: () => {},
      } as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Role.Admin, Role.Agent]);

      expect(() => rolesGuard.canActivate(mockContext)).toThrow(
        ForbiddenException,
      );
    });
  });
});

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request: Request = context.switchToHttp().getRequest();
    const tokenPayload = request[REQUEST_TOKEN_PAYLOAD_KEY] as TokenPayloadDto;

    if (!tokenPayload) throw new UnauthorizedException();

    const hasRole = requiredRoles.some((role) => tokenPayload.role === role);

    if (!hasRole) throw new ForbiddenException('Insufficient permissions.');

    return true;
  }
}

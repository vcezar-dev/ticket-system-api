import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { refreshToken } = request.body as RefreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found.');
    }

    try {
      const payload: TokenPayloadDto = await this.jwtService.verifyAsync(
        refreshToken,
        this.jwtConfiguration,
      );

      request[REQUEST_TOKEN_PAYLOAD_KEY] = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}

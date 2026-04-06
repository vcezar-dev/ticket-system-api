import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { Request } from 'express';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';

export const ActiveUser = createParamDecorator(
  (field: keyof TokenPayloadDto | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const payload = request[REQUEST_TOKEN_PAYLOAD_KEY] as TokenPayloadDto;
    return field ? payload?.[field] : payload;
  },
);

import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiSignInAuth() {
  return applyDecorators(
    ApiOperation({ summary: 'Sign in the application' }),
    ApiResponse({ status: 200, description: 'Login successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiRefreshAuth() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh the JWT token' }),
    ApiResponse({
      status: 200,
      description: 'Refresh Token authenticated',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

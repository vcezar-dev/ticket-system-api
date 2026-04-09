import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new user' }),
    ApiResponse({ status: 201, description: 'User created successfully' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
  );
}

export function ApiFindAllUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Return all users' }),
    ApiResponse({ status: 200, description: 'Users retrieved successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
  );
}

export function ApiFindOneUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Return a user by id' }),
    ApiResponse({ status: 200, description: 'User retrieved successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a user by id' }),
    ApiResponse({ status: 200, description: 'User updated successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a user by id' }),
    ApiResponse({ status: 204, description: 'User deleted successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}

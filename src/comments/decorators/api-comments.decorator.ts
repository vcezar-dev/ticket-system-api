import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function ApiCreateComment() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new comment for a ticket' }),
    ApiParam({
      name: 'ticketId',
      description: 'Ticket UUID',
      example: 'a0e3257b-e99d-4620-abff-104e288ee4a7',
    }),
    ApiResponse({ status: 201, description: 'Comment created successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Ticket not found' }),
  );
}

export function ApiFindAllComments() {
  return applyDecorators(
    ApiOperation({ summary: 'Return all comments for a ticket' }),
    ApiParam({
      name: 'ticketId',
      description: 'Ticket UUID',
      example: 'a0e3257b-e99d-4620-abff-104e288ee4a7',
    }),
    ApiResponse({
      status: 200,
      description: 'Comments retrieved successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Ticket not found' }),
  );
}

export function ApiDeleteComment() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a comment by id' }),
    ApiParam({
      name: 'ticketId',
      description: 'Ticket UUID',
      example: 'a0e3257b-e99d-4620-abff-104e288ee4a7',
    }),
    ApiResponse({ status: 204, description: 'Comment deleted successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Comment not found' }),
  );
}

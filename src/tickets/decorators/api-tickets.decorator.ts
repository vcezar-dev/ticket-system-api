import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateTicket() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new ticket' }),
    ApiResponse({ status: 201, description: 'Ticket created successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiFindAllTickets() {
  return applyDecorators(
    ApiOperation({
      summary: 'Return tickets (all for admin/agent, own for user)',
    }),
    ApiResponse({ status: 200, description: 'Tickets retrieved successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiUpdateTicket() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a ticket by id' }),
    ApiResponse({ status: 200, description: 'Ticket updated successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Ticket not found' }),
  );
}

export function ApiUpdateTicketStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Update ticket status and assigned user' }),
    ApiResponse({
      status: 200,
      description: 'Ticket status updated successfully',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Ticket not found' }),
    ApiResponse({
      status: 409,
      description: 'Ticket already closed or resolved',
    }),
  );
}

export function ApiDeleteTicket() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a ticket by id' }),
    ApiResponse({ status: 204, description: 'Ticket deleted successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Ticket not found' }),
  );
}

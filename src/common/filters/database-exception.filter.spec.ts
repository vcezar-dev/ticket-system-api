import { DatabaseExceptionFilter } from './database-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

describe('DatabaseExceptionFilter', () => {
  let filter: DatabaseExceptionFilter;

  beforeEach(() => {
    filter = new DatabaseExceptionFilter();
  });

  it('DatabaseExceptionFilter should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = jest.fn().mockReturnValue({ status });
    const host = {
      switchToHttp: jest.fn().mockReturnValue({ getResponse: response }),
    } as unknown as ArgumentsHost;

    it('should return 409 when unique constraint violation', () => {
      const exception = { code: '23505' } as QueryFailedError & {
        code: string;
      };

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with this value already exists.',
      });
    });

    it('should return 500 when other database error', () => {
      const exception = { code: 'other' } as QueryFailedError & {
        code: string;
      };

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error.',
      });
    });
  });
});

import { PaginationDto } from '../../common/dto/pagination.dto';

export const createMockPagination = (): PaginationDto => ({
  page: 1,
  limit: 10,
});

import { TEST_COMMENT_UUID, TEST_UUID } from '../test/constants/test.constants';
import { Role } from '../users/enums/role.enum';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    } as any;

    controller = new CommentsController(service);
  });

  it('CommentsController should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a comment', async () => {
    const dto = { content: 'test comment' };
    const tokenPayload = { sub: 'user-uuid' };
    const ticketId = 'ticket-uuid';

    const createdComment = { id: 'comment-uuid', ...dto };

    service.create.mockResolvedValue(createdComment);

    const result = await controller.create(ticketId, dto, tokenPayload);

    expect(service.create).toHaveBeenCalledWith(ticketId, dto, tokenPayload);
    expect(result).toEqual(createdComment);
  });

  it('should return all comments for a ticket', async () => {
    const tokenPayload = { sub: 'user-uuid', role: Role.Admin };
    const tickets = [
      {
        id: 'ticket-1-uuid',
        title: 'ticket-1-title',
      },
      {
        id: 'ticket-2-uuid',
        title: 'ticket-2-title',
      },
    ];

    service.findAll.mockResolvedValue(tickets);

    const result = await controller.findAll(TEST_UUID, tokenPayload);

    expect(service.findAll).toHaveBeenCalledWith(TEST_UUID, tokenPayload);
    expect(result).toEqual(tickets);
  });

  it('should delete a comment', async () => {
    const dto = { content: 'test comment' };

    service.delete.mockResolvedValue(undefined);

    const result = await controller.delete(TEST_UUID, TEST_COMMENT_UUID, dto);

    expect(service.delete).toHaveBeenCalledWith(
      TEST_UUID,
      TEST_COMMENT_UUID,
      dto,
    );
    expect(result).toBeUndefined();
  });
});

import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { TEST_COMMENT_UUID, TEST_UUID } from '../test/constants/test.constants';
import { CommentsController } from './comments.controller';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ResponseCommentDto } from './dto/response-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;

  const mockCommentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CommentsController(mockCommentsService as any);
  });

  it('CommentsController should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct arguments', async () => {
    const mockCreateCommentDto = {} as CreateCommentDto;
    const mockTokenPayloadDto = {} as TokenPayloadDto;
    const mockResponse = {} as ResponseCommentDto;

    jest.spyOn(mockCommentsService, 'create').mockResolvedValue(mockResponse);

    const result = await controller.create(
      TEST_UUID,
      mockCreateCommentDto,
      mockTokenPayloadDto,
    );

    expect(mockCommentsService.create).toHaveBeenCalledWith(
      TEST_UUID,
      mockCreateCommentDto,
      mockTokenPayloadDto,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call findAll with correct arguments', async () => {
    const mockTokenPayloadDto = {} as TokenPayloadDto;
    const mockResponse = [] as ResponseCommentDto[];

    jest.spyOn(mockCommentsService, 'findAll').mockResolvedValue(mockResponse);

    const result = await controller.findAll(TEST_UUID, mockTokenPayloadDto);

    expect(mockCommentsService.findAll).toHaveBeenCalledWith(
      TEST_UUID,
      mockTokenPayloadDto,
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call delete with correct arguments', async () => {
    const mockTokenPayloadDto = {} as TokenPayloadDto;

    jest.spyOn(mockCommentsService, 'delete').mockResolvedValue(undefined);

    const result = await controller.delete(
      TEST_UUID,
      TEST_COMMENT_UUID,
      mockTokenPayloadDto,
    );

    expect(mockCommentsService.delete).toHaveBeenCalledWith(
      TEST_UUID,
      TEST_COMMENT_UUID,
      mockTokenPayloadDto,
    );
    expect(result).toBeUndefined();
  });
});

import { Repository } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { TicketsService } from '../tickets/tickets.service';
import { UsersService } from '../users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockTicket } from '../test/factories/ticket.factory';
import { TEST_COMMENT_UUID, TEST_UUID } from '../test/constants/test.constants';
import { createMockUser } from '../test/factories/user.factory';
import { CreateCommentDto } from './dto/create-comment.dto';
import { createMockTokenPayload } from '../test/factories/auth.factory';
import { ResponseCommentDto } from './dto/response-comment.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '../users/enums/role.enum';
import { createMockComment } from '../test/factories/comment.factory';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let commentRepository: Repository<Comment>;
  let ticketsService: TicketsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: TicketsService,
          useValue: {
            findOneEntity: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneEntity: jest.fn(),
          },
        },
      ],
    }).compile();

    commentsService = module.get(CommentsService);
    commentRepository = module.get(getRepositoryToken(Comment));
    ticketsService = module.get(TicketsService);
    usersService = module.get(UsersService);
  });

  it('CommentsService should be defined', () => {
    expect(commentsService).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment on a ticket', async () => {
      const mockCreateCommentDto: CreateCommentDto = {
        content: 'test comment',
      };
      const mockTokenPayloadDto = createMockTokenPayload();
      const mockTicket = createMockTicket({ id: TEST_UUID });
      const mockUser = createMockUser();
      const mockComment = createMockComment(
        mockCreateCommentDto,
        mockUser,
        mockTicket,
      );

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);
      jest.spyOn(commentRepository, 'create').mockReturnValue(mockComment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(mockComment);

      const result = await commentsService.create(
        TEST_UUID,
        mockCreateCommentDto,
        mockTokenPayloadDto,
      );

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(usersService.findOneEntity).toHaveBeenCalledWith(
        mockTokenPayloadDto.sub,
      );
      expect(commentRepository.create).toHaveBeenCalledWith({
        ...mockCreateCommentDto,
        ticket: mockTicket,
        author: mockUser,
      });
      expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual(new ResponseCommentDto(mockComment));
    });

    it('should throw ForbiddenException when user is not the owner and not an admin or agent', async () => {
      const mockCreateCommentDto = {} as CreateCommentDto;
      const mockTokenPayloadDto = createMockTokenPayload({
        sub: 'other-uuid',
        role: Role.User,
      });
      const mockTicket = createMockTicket({ id: TEST_UUID });

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);

      await expect(
        commentsService.create(
          TEST_UUID,
          mockCreateCommentDto,
          mockTokenPayloadDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin/agent to create a comment even if they are not the owner', async () => {
      const mockCreateCommentDto = {} as CreateCommentDto;
      const mockTokenPayloadDto = createMockTokenPayload({
        sub: 'other-uuid',
        role: Role.Admin,
      });
      const mockTicket = createMockTicket({ id: TEST_UUID });
      const mockUser = createMockUser();
      const mockComment = {
        ...mockCreateCommentDto,
        ticket: mockTicket,
        author: mockUser,
      } as Comment;

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);
      jest.spyOn(commentRepository, 'create').mockReturnValue(mockComment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(mockComment);

      const result = await commentsService.create(
        TEST_UUID,
        mockCreateCommentDto,
        mockTokenPayloadDto,
      );

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(usersService.findOneEntity).toHaveBeenCalledWith(
        mockTokenPayloadDto.sub,
      );
      expect(commentRepository.create).toHaveBeenCalledWith(mockComment);
      expect(commentRepository.save).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual(new ResponseCommentDto(mockComment));
    });
  });

  describe('findAll', () => {
    it('should return all comments associated with the ticket', async () => {
      const mockTokenPayloadDto = createMockTokenPayload();
      const mockTicket = createMockTicket({ id: TEST_UUID });

      const mockComments = [createMockComment()];

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(commentRepository, 'find').mockResolvedValue(mockComments);

      const result = await commentsService.findAll(
        TEST_UUID,
        mockTokenPayloadDto,
      );

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(commentRepository.find).toHaveBeenCalledWith({
        where: { ticket: { id: TEST_UUID } },
        relations: ['author', 'ticket'],
      });
      expect(result).toEqual(
        mockComments.map((comment) => new ResponseCommentDto(comment)),
      );
    });
  });

  describe('delete', () => {
    it('should delete a comment', async () => {
      const mockTokenPayloadDto = createMockTokenPayload();
      const mockTicket = createMockTicket({ id: TEST_UUID });
      const mockComment = createMockComment({ id: TEST_COMMENT_UUID });

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(mockComment);
      jest.spyOn(commentRepository, 'remove').mockResolvedValue(mockComment);

      const result = await commentsService.delete(
        TEST_UUID,
        TEST_COMMENT_UUID,
        mockTokenPayloadDto,
      );

      expect(ticketsService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: TEST_COMMENT_UUID, ticket: { id: TEST_UUID } },
        relations: ['author'],
      });
      expect(commentRepository.remove).toHaveBeenLastCalledWith(mockComment);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when comment not found', async () => {
      const mockTokenPayloadDto = createMockTokenPayload();
      const mockTicket = createMockTicket({ id: TEST_UUID });

      jest.spyOn(ticketsService, 'findOneEntity').mockResolvedValue(mockTicket);
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(
        commentsService.delete(
          TEST_UUID,
          TEST_COMMENT_UUID,
          mockTokenPayloadDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

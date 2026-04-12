import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { HashingService } from '../common/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  createMockTokenPayload,
  createMockUser,
} from '../../test/factories/user.factory';
import { TEST_UUID } from '../../test/constants/test.constants';
import { Role } from './enums/role.enum';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: { hash: jest.fn(), compare: jest.fn() },
        },
      ],
    }).compile();

    usersService = module.get(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    hashingService = module.get(HashingService);
  });

  it('UsersService should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'user@email.com',
        name: 'username',
        password: 'secret-password',
      };

      const passwordHash = 'password-hashed';

      const mockNewUser = createMockUser({ passwordHash });

      jest.spyOn(hashingService, 'hash').mockResolvedValue('password-hashed');
      jest.spyOn(userRepository, 'create').mockReturnValue(mockNewUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockNewUser);

      const result = await usersService.create(createUserDto);

      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);

      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash,
      });

      expect(userRepository.save).toHaveBeenCalledWith(mockNewUser);

      expect(result).toEqual(new ResponseUserDto(mockNewUser));
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 'test-uuid', name: 'username', email: 'user@email.com' },
      ] as User[];

      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

      const result = await usersService.findAll();

      expect(userRepository.find).toHaveBeenCalled();

      expect(result).toEqual(
        mockUsers.map((user) => new ResponseUserDto(user)),
      );
    });
  });

  describe('findOneEntity', () => {
    it('should return an specific user entity', async () => {
      const mockUser = createMockUser({ id: TEST_UUID });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await usersService.findOneEntity(TEST_UUID);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: TEST_UUID },
      });

      expect(result).toBe(mockUser);
    });

    it('should throw not found exception when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(usersService.findOneEntity(TEST_UUID)).rejects.toThrow(
        new NotFoundException('User not found.'),
      );
    });
  });

  describe('findOne', () => {
    it('should return an user', async () => {
      const mockTokenPayload = createMockTokenPayload({ sub: TEST_UUID });

      const mockUser = createMockUser({ id: TEST_UUID });

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);

      const result = await usersService.findOne(TEST_UUID, mockTokenPayload);

      expect(usersService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);

      expect(result).toEqual(new ResponseUserDto(mockUser));
    });

    it('should return forbidden when user is not the owner', async () => {
      const mockUser = createMockUser();

      const mockTokenPayload = createMockTokenPayload({ sub: 'other-uuid' });

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);

      await expect(
        usersService.findOne(TEST_UUID, mockTokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to access other user', async () => {
      const mockUser = createMockUser();

      const mockTokenPayload = createMockTokenPayload({
        sub: 'other-uuid',
        role: Role.Admin,
      });

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);

      const result = await usersService.findOne(TEST_UUID, mockTokenPayload);

      expect(result).toEqual(new ResponseUserDto(mockUser));
    });
  });

  describe('update', () => {
    it('should update an user', async () => {
      const mockTokenPayload = createMockTokenPayload();

      const mockUpdateUserDto: UpdateUserDto = {
        email: 'user@email.com',
        name: 'username',
      };

      const mockUser = createMockUser();

      const mockUserUpdated = {
        ...mockUser,
        ...mockUpdateUserDto,
      };

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUserUpdated);

      const result = await usersService.update(
        TEST_UUID,
        mockUpdateUserDto,
        mockTokenPayload,
      );

      expect(usersService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(userRepository.save).toHaveBeenCalledWith(mockUserUpdated);

      expect(result).toEqual(new ResponseUserDto(mockUserUpdated));
    });

    it('should allow admin to update other user', async () => {
      const mockUpdateUserDto: UpdateUserDto = {
        email: 'user@email.com',
        name: 'username',
      };

      const mockTokenPayload = createMockTokenPayload({ role: Role.Admin });

      const mockUser = createMockUser({ id: 'other-uuid' });

      const mockUserUpdated = {
        ...mockUser,
        ...mockUpdateUserDto,
      };

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUserUpdated);

      const result = await usersService.update(
        TEST_UUID,
        mockUpdateUserDto,
        mockTokenPayload,
      );

      expect(usersService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(userRepository.save).toHaveBeenCalledWith(mockUserUpdated);

      expect(result).toEqual(new ResponseUserDto(mockUserUpdated));
    });

    it('should update user password', async () => {
      const mockUser = createMockUser();

      const mockTokenPayload = createMockTokenPayload();

      const mockUpdateUserDto: UpdateUserDto = {
        password: 'password',
      };

      const passwordHash = 'password-hashed';

      const mockUserWithHashedPassword = {
        ...mockUser,
        passwordHash,
      };

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(mockUserWithHashedPassword);

      const result = await usersService.update(
        TEST_UUID,
        mockUpdateUserDto,
        mockTokenPayload,
      );

      expect(usersService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(userRepository.save).toHaveBeenCalledWith(
        mockUserWithHashedPassword,
      );
      expect(hashingService.hash).toHaveBeenCalledWith(
        mockUpdateUserDto.password,
      );
      expect(result).toEqual(new ResponseUserDto(mockUserWithHashedPassword));
    });

    it('should return forbidden when user is not the owner', async () => {
      const mockUpdateUserDto: UpdateUserDto = {
        email: 'user@email.com',
        password: 'password',
        name: 'username',
      };

      const mockUser = createMockUser();

      const mockTokenPayload = createMockTokenPayload({ sub: 'other-uuid' });

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);

      await expect(
        usersService.update(TEST_UUID, mockUpdateUserDto, mockTokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove an user', async () => {
      const mockUser = createMockUser({ id: TEST_UUID });

      jest.spyOn(usersService, 'findOneEntity').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(mockUser);

      const result = await usersService.remove(TEST_UUID);

      expect(usersService.findOneEntity).toHaveBeenCalledWith(TEST_UUID);
      expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(new ResponseUserDto(mockUser));
    });
  });
});

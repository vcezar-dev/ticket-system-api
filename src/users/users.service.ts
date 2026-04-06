import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ResponseUserDto } from './dto/response-user.dto';
import { HashingService } from '../common/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}
  private async findUserEntity(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found.');

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const passwordHash = await this.hashingService.hash(createUserDto.password);

    const newUser = {
      email: createUserDto.email,
      name: createUserDto.name,
      passwordHash,
    };

    const user = this.userRepository.create(newUser);

    await this.userRepository.save(user);

    return new ResponseUserDto(user);
  }

  async findAll(): Promise<ResponseUserDto[]> {
    const users = await this.userRepository.find();

    return users.map((user) => new ResponseUserDto(user));
  }

  async findOne(id: string): Promise<ResponseUserDto> {
    const user = await this.findUserEntity(id);

    return new ResponseUserDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    const user = await this.findUserEntity(id);

    if (updateUserDto.password) {
      user.passwordHash = await this.hashingService.hash(
        updateUserDto.password,
      );
    }

    const { password: _, ...rest } = updateUserDto;
    Object.assign(user, rest);

    const updated = await this.userRepository.save(user);

    return new ResponseUserDto(updated);
  }

  async remove(id: string): Promise<ResponseUserDto> {
    const user = await this.findUserEntity(id);

    const response = new ResponseUserDto(user);

    await this.userRepository.remove(user);

    return response;
  }
}

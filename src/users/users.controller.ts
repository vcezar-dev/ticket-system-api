import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { Public } from '../auth/decorators/public.decorator';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateUser,
  ApiDeleteUser,
  ApiFindAllUsers,
  ApiFindOneUser,
  ApiUpdateUser,
} from './decorators/api-users.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreateUser()
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiFindAllUsers()
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiFindOneUser()
  @ApiBearerAuth()
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.usersService.findOne(id, tokenPayloadDto);
  }

  @ApiUpdateUser()
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser() tokenPayloadDto: TokenPayloadDto,
  ) {
    return this.usersService.update(id, updateUserDto, tokenPayloadDto);
  }

  @ApiDeleteUser()
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}

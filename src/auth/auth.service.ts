import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../common/hashing/hashing.service';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { Role } from '../users/enums/role.enum';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}
  private async signJwtAsync(sub: string, role: Role, expiresIn: number) {
    return await this.jwtService.signAsync(
      {
        sub,
        role,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  private async createTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signJwtAsync(
        user.id,
        user.role,
        this.jwtConfiguration.accessTokenTtl,
      ),
      this.signJwtAsync(
        user.id,
        user.role,
        this.jwtConfiguration.refreshTokenTtl,
      ),
    ]);
    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOneBy({
      email: loginDto.email,
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email or password invalid');
    }

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password invalid');
    }

    return this.createTokens(user);
  }

  async refresh(tokenPayloadDto: TokenPayloadDto) {
    const user = await this.userRepository.findOneBy({
      id: tokenPayloadDto.sub,
    });

    if (!user) throw new UnauthorizedException('User not found.');

    return this.createTokens(user);
  }
}

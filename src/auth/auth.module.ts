import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CommonModule } from '../common/common.module';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, ConfigModule],
})
export class AuthModule {}

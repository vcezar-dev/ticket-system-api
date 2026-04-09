import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ActiveUser } from './decorators/active-user.decorator';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiRefreshAuth, ApiSignInAuth } from './decorators/api-auth.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiSignInAuth()
  @Public()
  @Post('login')
  login(@Body() signInDto: SignInDto) {
    return this.authService.login(signInDto);
  }

  @ApiRefreshAuth()
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(@ActiveUser() tokenPayloadDto: TokenPayloadDto) {
    return this.authService.refresh(tokenPayloadDto);
  }
}

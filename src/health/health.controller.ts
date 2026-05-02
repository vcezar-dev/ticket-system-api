import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health
      .check([() => this.db.pingCheck('database')])
      .then((result) => ({
        ...result,
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
      }));
  }
}

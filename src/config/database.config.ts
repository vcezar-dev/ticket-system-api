import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { env } from './env.validation';

export default registerAs(
  'database',
  () =>
    ({
      type: 'postgres',
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      username: env.DATABASE_USERNAME,
      database: env.DATABASE_DATABASE,
      password: env.DATABASE_PASSWORD,
      autoLoadEntities: true,
      synchronize: false,
      logging: env.DATABASE_LOGGING,
    }) satisfies TypeOrmModuleOptions,
);

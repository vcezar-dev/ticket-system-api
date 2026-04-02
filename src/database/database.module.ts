import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from 'src/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (config: ConfigType<typeof databaseConfig>) => config,
    }),
  ],
})
export class DatabaseModule {}

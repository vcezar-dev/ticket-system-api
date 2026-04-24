import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { setupApp } from '../../src/app.setup';

export async function createTestApp() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  setupApp(app);
  await app.init();

  const dataSource = moduleFixture.get(DataSource);
  await dataSource.runMigrations();

  return { app, dataSource, moduleFixture };
}

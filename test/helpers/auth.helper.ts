import { DataSource } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Role } from '../../src/users/enums/role.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import request from 'supertest';

export async function seedUserAndLogin(
  moduleFixture: TestingModule,
  app: INestApplication,
  overrides?: Partial<User>,
) {
  const dataSource = moduleFixture.get(DataSource);
  const userRepository = dataSource.getRepository(User);

  const passwordHash = await bcrypt.hash(
    'secret-password',
    await bcrypt.genSalt(),
  );

  const name = randomUUID().slice(0, 8);

  const user = await userRepository.save({
    id: randomUUID(),
    name: name,
    email: `${name}@email.com`,
    passwordHash,
    role: Role.User,
    ...overrides,
  });

  const accessToken = await getAccessToken(app, user.email, 'secret-password');

  return { accessToken, user };
}

export async function getAccessToken(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(HttpStatus.CREATED);

  const body = response.body as { accessToken: string };
  return body.accessToken;
}

export async function seedUser(
  moduleFixture: TestingModule,
  overrides?: Partial<User>,
  password?: string,
): Promise<User> {
  const dataSource = moduleFixture.get(DataSource);
  const userRepository = dataSource.getRepository(User);

  const passwordHash = await bcrypt.hash(
    password || 'secret-password',
    await bcrypt.genSalt(),
  );

  const name = randomUUID().slice(0, 8);

  const user = await userRepository.save({
    id: randomUUID(),
    name: name,
    email: `${name}@email.com`,
    passwordHash,
    role: Role.User,
    ...overrides,
  });

  return user;
}

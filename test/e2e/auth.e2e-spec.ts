import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../helpers/app.helper';
import request from 'supertest';
import { Role } from '../../src/users/enums/role.enum';
import { seedUser } from '../helpers/auth.helper';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    ({ app, dataSource, moduleFixture } = await createTestApp());
  });

  afterEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE "comment", "ticket", "user" CASCADE',
    );
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  const login = {
    email: 'user@email.com',
    password: 'secret-password',
  };

  describe('/auth/login (POST)', () => {
    it('should login a user', async () => {
      await seedUser(moduleFixture, {
        name: 'user',
        email: 'user@email.com',
        role: Role.User,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(login);

      const body = response.body as AuthResponse;

      expect(body.accessToken).toEqual(expect.any(String));
      expect(body.refreshToken).toEqual(expect.any(String));
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return 401 when user not exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(login);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 when password is invalid', async () => {
      await seedUser(
        moduleFixture,
        {
          name: 'user',
          email: 'user@email.com',
          role: Role.User,
        },
        'other-password',
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(login)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 when body is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh a token', async () => {
      await seedUser(moduleFixture, {
        name: 'user',
        email: 'user@email.com',
        role: Role.User,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(login)
        .expect(HttpStatus.CREATED);

      const { refreshToken } = loginResponse.body as AuthResponse;

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken });

      const body = response.body as AuthResponse;

      expect(body.accessToken).toEqual(expect.any(String));
      expect(body.refreshToken).toEqual(expect.any(String));
      expect(response.status).toBe(HttpStatus.CREATED);
    });

    it('should return 401 when refresh token is not passed', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 when refresh token is invalid or expired', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});

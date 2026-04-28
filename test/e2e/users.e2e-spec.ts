import { TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { createTestApp } from '../helpers/app.helper';
import { seedUserAndLogin } from '../helpers/auth.helper';
import { adminOverrides } from '../constants/e2e.constants';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

describe('Users (e2e)', () => {
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

  describe('/users (POST)', () => {
    it('should create a user with success', async () => {
      const createUserDto = {
        name: 'user',
        email: 'user@email.com',
        password: 'secret-password',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const body = response.body as UserResponse;

      expect(body.name).toBe(createUserDto.name);
      expect(body.email).toBe(createUserDto.email);

      expect(body.id).toEqual(expect.any(String));
      expect(body.createdAt).toEqual(expect.any(String));
      expect(body.updatedAt).toEqual(expect.any(String));
    });

    it('should return 409 when email already exists', async () => {
      const createUserDto = {
        name: 'user',
        email: 'user@email.com',
        password: 'secret-password',
      };

      await request(app.getHttpServer()).post('/users').send(createUserDto);
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it('should return 400 when body is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/users (GET)', () => {
    it('should return all users when user has role admin', async () => {
      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as UserResponse[];

      expect(body.length).toBeGreaterThan(0);
    });

    it('should return 403 when user does not has role admin', async () => {
      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a user with success', async () => {
      const id = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(moduleFixture, app, {
        id,
      });

      const response = await request(app.getHttpServer())
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      const body = response.body as UserResponse;

      expect(body.id).toEqual(id);
      expect(body.name).toBe(user.name);
      expect(body.email).toBe(user.email);

      expect(body.createdAt).toEqual(expect.any(String));
      expect(body.updatedAt).toEqual(expect.any(String));
    });

    it('should return 404 when user not exists', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      await request(app.getHttpServer())
        .get(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 when token is missing', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update a user with success', async () => {
      const updateUserDto = {
        name: 'other name',
        password: 'ultra-secret-password',
      };

      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(moduleFixture, app, {
        id,
      });

      const response = await request(app.getHttpServer())
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as UserResponse;

      expect(body.id).toEqual(id);
      expect(body.name).toBe('other name');

      expect(body.createdAt).toEqual(expect.any(String));
      expect(body.updatedAt).toEqual(expect.any(String));
    });

    it('should return 403 when user is not owner or has role admin', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const response = await request(app.getHttpServer())
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 404 when user not exists', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const response = await request(app.getHttpServer())
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should delete a user with success', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(moduleFixture, app, {
        ...adminOverrides,
        id,
      });

      const response = await request(app.getHttpServer())
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return 404 when user not exists', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const response = await request(app.getHttpServer())
        .delete(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});

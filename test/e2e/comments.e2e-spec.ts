import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { createTestApp } from '../helpers/app.helper';
import { seedUser, seedUserAndLogin } from '../helpers/auth.helper';
import { randomUUID } from 'crypto';
import { seedComment, seedTicket } from '../helpers/tickets.helper';
import request from 'supertest';
import { UserSummary } from '../interfaces/user-summary.interface';
import { adminOverrides, agentOverrides } from '../constants/e2e.constants';

interface TicketSummary {
  id: string;
  title: string;
}

interface CommentsResponse {
  id: string;
  content: string;
  ticket: TicketSummary;
  author: UserSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

describe('Comments (e2e)', () => {
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

  describe('/tickets/:ticketId/comments (POST)', () => {
    it('should create a comment on a ticket', async () => {
      const ticketId = randomUUID();

      const createCommentDto = { content: 'test comment' };

      const { accessToken, user } = await seedUserAndLogin(moduleFixture, app);

      await seedTicket(moduleFixture, user, { id: ticketId });

      const response = await request(app.getHttpServer())
        .post(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createCommentDto);

      expect(response.status).toBe(HttpStatus.CREATED);

      const body = response.body as CommentsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: createCommentDto.content,
          ticket: expect.objectContaining({
            id: ticketId,
            title: expect.any(String),
          }),
          author: { id: user.id, name: user.name },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it('should return 403 when user is not the owner or has role Admin/Agent', async () => {
      const ticketId = randomUUID();

      const createCommentDto = { content: 'test comment' };

      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      await seedTicket(moduleFixture, undefined, { id: ticketId });

      const response = await request(app.getHttpServer())
        .post(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createCommentDto);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should allow admin create a comment on a ticket', async () => {
      const ticketId = randomUUID();

      const createCommentDto = { content: 'test comment' };

      const anyUser = await seedUser(moduleFixture);

      const { accessToken, user } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      await seedTicket(moduleFixture, anyUser, { id: ticketId });

      const response = await request(app.getHttpServer())
        .post(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createCommentDto);

      expect(response.status).toBe(HttpStatus.CREATED);

      const body = response.body as CommentsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: createCommentDto.content,
          ticket: expect.objectContaining({
            id: ticketId,
            title: expect.any(String),
          }),
          author: { id: user.id, name: user.name },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it('should allow agent create a comment on a ticket', async () => {
      const ticketId = randomUUID();

      const createCommentDto = { content: 'test comment' };

      const anyUser = await seedUser(moduleFixture);

      const { accessToken, user } = await seedUserAndLogin(
        moduleFixture,
        app,
        agentOverrides,
      );

      await seedTicket(moduleFixture, anyUser, { id: ticketId });

      const response = await request(app.getHttpServer())
        .post(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createCommentDto);

      expect(response.status).toBe(HttpStatus.CREATED);

      const body = response.body as CommentsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: createCommentDto.content,
          ticket: expect.objectContaining({
            id: ticketId,
            title: expect.any(String),
          }),
          author: { id: user.id, name: user.name },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });

    it('should return 401 when token is missing', async () => {
      const response = await request(app.getHttpServer()).post(
        `/tickets/${randomUUID()}/comments`,
      );

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 when body is invalid', async () => {
      const ticketId = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(moduleFixture, app);

      await seedTicket(moduleFixture, user, { id: ticketId });

      const response = await request(app.getHttpServer())
        .post(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/tickets/:ticketId/comments (GET)', () => {
    it('should return all comments from a ticket', async () => {
      const ticketId = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(moduleFixture, app);

      const ticket = await seedTicket(moduleFixture, user, { id: ticketId });

      await seedComment(moduleFixture, ticket, user);
      await seedComment(moduleFixture, ticket, user);

      const response = await request(app.getHttpServer())
        .get(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as CommentsResponse[];

      expect(body.length).toBeGreaterThan(0);

      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            content: expect.any(String),
            ticket: expect.objectContaining({
              id: ticketId,
              title: expect.any(String),
            }),
            author: { id: user.id, name: user.name },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      );
    });

    it('should return 403 when user is not the owner or has role Admin/Agent', async () => {
      const ticketId = randomUUID();

      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const user = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, user, { id: ticketId });

      const response = await request(app.getHttpServer())
        .get(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should allow admin to see all comments from a ticket', async () => {
      const ticketId = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      const ticket = await seedTicket(moduleFixture, anyUser, { id: ticketId });

      await seedComment(moduleFixture, ticket, anyUser);
      await seedComment(moduleFixture, ticket, user);

      const response = await request(app.getHttpServer())
        .get(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as CommentsResponse[];

      expect(body.length).toBeGreaterThan(0);

      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            content: expect.any(String),
            ticket: expect.objectContaining({
              id: ticketId,
              title: expect.any(String),
            }),
            author: { id: expect.any(String), name: expect.any(String) },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      );
    });

    it('should allow agent to see all comments from a ticket', async () => {
      const ticketId = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(
        moduleFixture,
        app,
        agentOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      const ticket = await seedTicket(moduleFixture, anyUser, { id: ticketId });

      await seedComment(moduleFixture, ticket, anyUser);
      await seedComment(moduleFixture, ticket, user);

      const response = await request(app.getHttpServer())
        .get(`/tickets/${ticketId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as CommentsResponse[];

      expect(body.length).toBeGreaterThan(0);

      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            content: expect.any(String),
            ticket: expect.objectContaining({
              id: ticketId,
              title: expect.any(String),
            }),
            author: { id: expect.any(String), name: expect.any(String) },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      );
    });
  });

  describe('/tickets/:ticketId/comments/:id (DELETE)', () => {
    it('should allow admin delete a comment from a ticket', async () => {
      const ticketId = randomUUID();

      const commentId = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      const ticket = await seedTicket(moduleFixture, anyUser, { id: ticketId });

      await seedComment(moduleFixture, ticket, anyUser, { id: commentId });

      const response = await request(app.getHttpServer())
        .delete(`/tickets/${ticketId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should allow agent delete a comment from a ticket', async () => {
      const ticketId = randomUUID();

      const commentId = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        agentOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      const ticket = await seedTicket(moduleFixture, anyUser, { id: ticketId });

      await seedComment(moduleFixture, ticket, anyUser, { id: commentId });

      const response = await request(app.getHttpServer())
        .delete(`/tickets/${ticketId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return 403 when user is not the owner or has role Admin/Agent', async () => {
      const ticketId = randomUUID();

      const commentId = randomUUID();

      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const anyUser = await seedUser(moduleFixture);

      const ticket = await seedTicket(moduleFixture, anyUser, { id: ticketId });

      await seedComment(moduleFixture, ticket, anyUser, { id: commentId });

      const response = await request(app.getHttpServer())
        .delete(`/tickets/${ticketId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 404 when comment not found', async () => {
      const ticketId = randomUUID();

      const commentId = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      await seedTicket(moduleFixture, user, { id: ticketId });

      const response = await request(app.getHttpServer())
        .delete(`/tickets/${ticketId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 400 when comment id is not a valid UUID', async () => {
      const ticketId = randomUUID();

      const commentId = 'not_a_UUID';

      const { accessToken, user } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      await seedTicket(moduleFixture, user, { id: ticketId });

      const response = await request(app.getHttpServer())
        .delete(`/tickets/${ticketId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});

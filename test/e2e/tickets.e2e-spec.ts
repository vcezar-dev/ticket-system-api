import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { createTestApp } from '../helpers/app.helper';
import { DataSource } from 'typeorm';
import { TestingModule } from '@nestjs/testing';
import { Priority } from '../../src/tickets/enums/priority.enum';
import { Category } from '../../src/tickets/enums/category.enum';
import { seedUser, seedUserAndLogin } from '../helpers/auth.helper';
import { Status } from '../../src/tickets/enums/status.enum';
import { seedTicket } from '../helpers/tickets.helper';
import { adminOverrides, agentOverrides } from '../constants/e2e.constants';
import { randomUUID } from 'crypto';

interface userSummary {
  id: string;
  name: string;
}

interface ticketsResponse {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  category: Category;
  createdBy: userSummary | null;
  assignedTo: userSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

describe('tickets (e2e)', () => {
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

  describe('/tickets (POST)', () => {
    it('should create a ticket', async () => {
      const createTicketDto = {
        title: 'ticket title',
        description: 'Description of the ticket',
        priority: Priority.Low,
        category: Category.Support,
      };

      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const response = await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createTicketDto);

      expect(response.status).toBe(HttpStatus.CREATED);

      const body = response.body as ticketsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          title: createTicketDto.title,
          description: createTicketDto.description,
          priority: createTicketDto.priority,
          category: createTicketDto.category,
          status: expect.any(String),
          assignedTo: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      );
    });

    it('should return 400 when body is invalid', async () => {
      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const response = await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets')
        .send({});

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/tickets (GET)', () => {
    it('should return all tickets from a user', async () => {
      const { accessToken, user } = await seedUserAndLogin(moduleFixture, app);

      await seedTicket(moduleFixture, user);

      const response = await request(app.getHttpServer())
        .get('/tickets')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as ticketsResponse[];

      expect(body.length).toBeGreaterThan(0);

      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            description: expect.any(String),
            priority: expect.any(String),
            category: expect.any(String),
            status: expect.any(String),
            assignedTo: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            createdBy: expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
            }),
          }),
        ]),
      );
    });

    it('should return all tickets when user has role admin or agent', async () => {
      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const user = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, user);

      const response = await request(app.getHttpServer())
        .get('/tickets')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as ticketsResponse[];

      expect(body.length).toBeGreaterThan(0);
    });

    it('should return 401 when authorization is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .send({});

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/tickets/:id (PATCH)', () => {
    it('should update a ticket from a user', async () => {
      const id = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(moduleFixture, app);

      await seedTicket(moduleFixture, user, { id });

      const updateTicketDto = {
        title: 'ticket title updated',
        description: 'Description of the ticket updated',
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateTicketDto);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as ticketsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          title: updateTicketDto.title,
          description: updateTicketDto.description,
          priority: expect.any(String),
          category: expect.any(String),
          status: expect.any(String),
          assignedTo: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      );
    });

    it('should allow admin/agent to update a ticket even if they are not the owner', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const user = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, user, { id });

      const updateTicketDto = {
        title: 'ticket title updated',
        description: 'Description of the ticket updated',
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateTicketDto);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as ticketsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          title: updateTicketDto.title,
          description: updateTicketDto.description,
          priority: expect.any(String),
          category: expect.any(String),
          status: expect.any(String),
          assignedTo: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      );
    });

    it('should return 403 when user is not the owner or has role Admin/Agent', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const user = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, user, { id });

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 404 when ticket not found', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const user = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, user);

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('/tickets/:id/status (PATCH)', () => {
    it('should allow admin update a status from a ticket', async () => {
      const id = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, anyUser, { id });

      const updateStatusDto = {
        status: Status.In_progress,
        assignedTo: user.id,
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStatusDto);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as ticketsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          priority: expect.any(String),
          category: expect.any(String),
          status: updateStatusDto.status,
          assignedTo: { id: user.id, name: user.name },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      );
    });

    it('should allow agent update a status from a ticket', async () => {
      const id = randomUUID();

      const { accessToken, user } = await seedUserAndLogin(
        moduleFixture,
        app,
        agentOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, anyUser, { id });

      const updateStatusDto = {
        status: Status.In_progress,
        assignedTo: user.id,
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStatusDto);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as ticketsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          priority: expect.any(String),
          category: expect.any(String),
          status: updateStatusDto.status,
          assignedTo: { id: user.id, name: user.name },
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      );
    });

    it('should update status without assignedTo', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, anyUser, { id });

      const updateStatusDto = {
        status: Status.In_progress,
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStatusDto);

      expect(response.status).toBe(HttpStatus.OK);

      const body = response.body as ticketsResponse;

      expect(body).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          priority: expect.any(String),
          category: expect.any(String),
          status: updateStatusDto.status,
          assignedTo: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          createdBy: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      );
    });

    it('should return 409 when ticket already closed or resolved', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const user = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, user, { id, status: Status.Closed });

      const updateStatusDto = {
        status: Status.In_progress,
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStatusDto);

      expect(response.status).toBe(HttpStatus.CONFLICT);
    });

    it('should return 404 when ticket not found', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const user = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, user);

      const updateStatusDto = {
        status: Status.In_progress,
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStatusDto);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 403 when user is not the owner or has role Admin/Agent', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const anyUser = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, anyUser, { id });

      const updateStatusDto = {
        status: Status.In_progress,
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateStatusDto);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('/tickets/:id (DELETE)', () => {
    it('should delete a ticket from a user', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, anyUser, { id });

      const response = await request(app.getHttpServer())
        .delete(`/tickets/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return 404 when ticket not found', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(
        moduleFixture,
        app,
        adminOverrides,
      );

      const anyUser = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, anyUser);

      const response = await request(app.getHttpServer())
        .delete(`/tickets/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 403 when user is not the owner or has role Admin/Agent', async () => {
      const id = randomUUID();

      const { accessToken } = await seedUserAndLogin(moduleFixture, app);

      const anyUser = await seedUser(moduleFixture);

      await seedTicket(moduleFixture, anyUser, { id });

      const response = await request(app.getHttpServer())
        .delete(`/tickets/${id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
    });
  });
});

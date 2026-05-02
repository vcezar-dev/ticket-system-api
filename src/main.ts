import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApp(app);

  const config = new DocumentBuilder()
    .setTitle('Ticket System API')
    .setDescription('REST API for ticket management system')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('tickets', 'Ticket management')
    .addTag('comments', 'Ticket comments')
    .addTag('health', 'Health check')
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

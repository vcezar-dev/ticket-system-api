import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { TicketsModule } from '../tickets/tickets.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    forwardRef(() => TicketsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}

import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [PrismaModule, LoggerModule]
})
export class TasksModule {}

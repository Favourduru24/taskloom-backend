import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [PrismaModule, LoggerModule, TasksModule]
})
export class DashboardModule {}

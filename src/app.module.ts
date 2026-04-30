import { Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { AppConfiguration } from './config/app.config';
import { AuthConfiguration } from './config/auth.config';
import { WorkspaceModule } from './workspace/workspace.module';
import { TasksModule } from './tasks/tasks.module';
import { LibraryModule } from './library/library.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
   ConfigModule.forRoot({
    isGlobal: true,
    load: [
      AppConfiguration,
      AuthConfiguration
    ]
   }),
   AuthModule,
   LoggerModule,
   WorkspaceModule,
   TasksModule,
   LibraryModule,
  //  DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

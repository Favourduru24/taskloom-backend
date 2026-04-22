import { Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { AppConfiguration } from './config/app.config';
import { AuthConfiguration } from './config/auth.config';

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
   LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

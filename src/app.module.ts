import { Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    PrismaModule,
   ConfigModule.forRoot({
    isGlobal: true
   }),
   AuthModule,
   LoggerModule
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}

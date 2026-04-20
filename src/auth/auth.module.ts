import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfiguration } from 'src/config/app.config';
import { AuthConfiguration } from 'src/config/auth.config';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        ConfigModule.forFeature(AppConfiguration),
        ConfigModule.forFeature(AuthConfiguration),
        PrismaModule, LoggerModule
    ]
})

export class AuthModule {
    
}

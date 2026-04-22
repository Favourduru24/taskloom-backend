import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfiguration } from 'src/config/app.config';
import { AuthConfiguration } from 'src/config/auth.config';
import { OtpService } from '../lib/otp.service';
import { EmailModule } from 'src/lib/email.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService, OtpService],
    imports: [
        ConfigModule.forFeature(AppConfiguration),
        ConfigModule.forFeature(AuthConfiguration),
        PrismaModule, LoggerModule, EmailModule
    ]
})

export class AuthModule {
    
}

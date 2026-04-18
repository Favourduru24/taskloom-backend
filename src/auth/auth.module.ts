import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [PrismaService, LoggerModule]
})

export class AuthModule {
    
}

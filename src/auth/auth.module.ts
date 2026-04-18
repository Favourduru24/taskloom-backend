import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [PrismaModule, LoggerModule]
})

export class AuthModule {
    
}

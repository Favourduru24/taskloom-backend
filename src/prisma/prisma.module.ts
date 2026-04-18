import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [LoggerModule]
})
export class PrismaModule {}

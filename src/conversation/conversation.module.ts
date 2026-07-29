import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { LoggerModule } from 'src/logger/logger.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [ConversationService],
  controllers: [ConversationController],
  imports: [LoggerModule, PrismaModule, AuthModule]
})

export class ConversationModule {}

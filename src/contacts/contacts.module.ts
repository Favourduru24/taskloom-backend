import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { EventModule } from 'src/event/event-module';

@Module({
    controllers: [ContactsController],
    providers: [ContactsService],
    imports: [PrismaModule, LoggerModule, EventModule]
})
export class ContactsModule {}

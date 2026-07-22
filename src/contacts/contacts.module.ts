import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
    controllers: [ContactsController],
    providers: [ContactsService],
    imports: [PrismaModule, LoggerModule]
})
export class ContactsModule {}

import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/lib/cloudinary.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  controllers: [LibraryController],
  providers: [LibraryService],
  imports: [PrismaModule, CloudinaryModule, LoggerModule]
})
export class LibraryModule {}

import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { CloudinaryModule } from 'src/lib/cloudinary.module';

@Module({
  providers: [WorkspaceService],
  controllers: [WorkspaceController],
  imports: [PrismaModule, LoggerModule, CloudinaryModule]
})
export class WorkspaceModule {}

import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { User } from '@prisma/client';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { handle } from 'src/common/utils/handle';
import { LoggerService } from 'src/logger/logger.service';
import { LibraryService } from './library.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('library')
@Auth()
export class LibraryController {

    constructor(private readonly libaryService: LibraryService, private readonly logger: LoggerService) {}
    @Post(':workspaceId/upload')
    @ResponseMessage('Asset uploaded to library successfully')
    @UseInterceptors(FileInterceptor('file'))
    uploadImage(@AuthUser() user: User, @UploadedFile() file: Express.Multer.File, @Param('workspaceId') workspaceId: string) {
        return handle(
            this.logger,
            () => this.libaryService.uploadAsset(file, workspaceId, user.id),
            'LibaryController.upload'
        )
    }
}

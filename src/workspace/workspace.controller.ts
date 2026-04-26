import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { handle } from 'src/common/utils/handle';
import { WorkspaceService } from './workspace.service';
import { WorkspaceDto } from './dto/workspace.dto';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import type { User } from '@prisma/client';
import { LoggerService } from 'src/logger/logger.service';

@Controller('workspace')
@Auth()
export class WorkspaceController {

     constructor(private readonly logger: LoggerService, private readonly workSpaceService: WorkspaceService) {}

    @Post()
    @ResponseMessage('Workspace created successfully.')
    async create (@AuthUser() user: User, @Body() dto: WorkspaceDto) {
       return handle(
        this.logger,
        () => this.workSpaceService.create(user.id, dto),
        'create'
       )
    }

    @Get()
    @ResponseMessage('Workspace fetched successfully')
    async list(@AuthUser() user: User) {
       return handle(
        this.logger,
        () => this.workSpaceService.list(user.id),
        'list' 
       )
    }
    @Get(':workspaceId/member')
    @ResponseMessage('Workspace Team members fetched successfully')
    async workspaceMember(@AuthUser() user: User, @Param('workspaceId')  workspaceId: string) {
       return handle(
        this.logger,
        () => this.workSpaceService.getWorkspaceMember(workspaceId, user.id),
        'list' 
       )
    }
}

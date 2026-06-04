import { Controller, Get, Param } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { handle } from 'src/common/utils/handle';
import { LoggerService } from 'src/logger/logger.service';
import { DashboardService } from './dashboard.service';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import type { User } from '@prisma/client';

@Controller('dashboard')
@Auth()
export class DashboardController {

    constructor(private readonly logger: LoggerService, private readonly dashboardService: DashboardService) {}
    @Get(':workspaceId/stats')
    @ResponseMessage('Workspace tasks stats fetched successfully.')
    async getWorkspaceTaskStats (@AuthUser() user: User, @Param('workspaceId') workspaceId: string, ) {
       return handle(
        this.logger,
        () => this.dashboardService.getWorkspaceStat(user.id, workspaceId),
        'DashboardController.getStats'
       )
    }
}

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
    @Get(':workspaceId/today/task')
    @ResponseMessage('Workspace today tasks fetched successfully.')
    async getWorkspaceTodayTask (@AuthUser() user: User, @Param('workspaceId') workspaceId: string, ) {
       return handle(
        this.logger,
        () => this.dashboardService.getTodayTask(user.id, workspaceId),
        'DashboardController.getTodayTask'
       )
    }
    @Get(':workspaceId/upcomming/followup')
    @ResponseMessage('Workspace fetched upcomming followup successfully.')
    async getWorkspaceUpcommingFollowUp (@AuthUser() user: User, @Param('workspaceId') workspaceId: string, ) {
       return handle(
        this.logger,
        () => this.dashboardService.getUpCommingFollowup(user.id, workspaceId),
        'DashboardController.getUpcommingFollowUp'
       )
    }
    @Get(':workspaceId/today/followup')
    @ResponseMessage('Workspace fetched today followup successfully.')
    async getWorkspaceTodayFollowUp (@AuthUser() user: User, @Param('workspaceId') workspaceId: string, ) {
       return handle(
        this.logger,
        () => this.dashboardService.getTodayFollowup(user.id, workspaceId),
        'DashboardController.getTodayFollowUp'
       )
    }
}

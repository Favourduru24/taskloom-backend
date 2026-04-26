import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { handle } from 'src/common/utils/handle';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreateTaskDto } from './dto/task.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import type { User } from '@prisma/client';

@Controller('tasks')
@Auth()
export class TasksController {

    constructor(private readonly taskService: TasksService, private readonly logger: LoggerService) {}
    @Post()
    @ResponseMessage('Task created successfully.')
    async create (@Body() dto: CreateTaskDto, @AuthUser() user: User) {
        return handle(
           this.logger,
           () => this.taskService.createTask(dto, user.id),
           'TaskController.create'
        )
    }
    @Get(':workspaceId')
    @ResponseMessage('Task fetched successfully.')
    async getWorkspaceTask(
      @Param('workspaceId') workspaceId: string,
    ) {
      return handle(
        this.logger,
        () => this.taskService.getTask(workspaceId),
        'TaskController.getTask'
      );
    }
}

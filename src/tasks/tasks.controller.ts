import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { handle } from 'src/common/utils/handle';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import type { User } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task.dto';

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
      @AuthUser() user: User,
      @Param('workspaceId') workspaceId: string,
    ) {
      return handle(
        this.logger,
        () => this.taskService.getTask(workspaceId, user.id),
        'TaskController.getTask'
      );
    }

    @Patch(':workspaceId/task/:taskId')
    @ResponseMessage('Task edited successfully')
    async edit(@AuthUser() user: User, @Param('workspaceId') workspaceId: string, @Param('taskId') taskId: string, @Body() dto: UpdateTaskDto) {
      return handle(
        this.logger,
        () => this.taskService.editTask(user.id, workspaceId, taskId, dto),
        'task.edited'
      )
    }

    @Get(':workspaceId/task/:taskId')
    @ResponseMessage('Task details fetched successfully')
    async TaskDetails(@AuthUser() user: User, @Param('workspaceId') workspaceId: string, @Param('taskId') taskId: string) {
      return handle(
         this.logger,
        () => this.taskService.getTaskDetails(user.id, workspaceId, taskId),
        'task.detail'
      )
    }

    @Delete(':workspaceId/task/:taskId')
    @ResponseMessage('Task deleted successfully')
    async deleteTask(@AuthUser() user: User, @Param('workspaceId') workspaceId: string, @Param('taskId') taskId: string) {
      return handle(
        this.logger,
        () => this.taskService.deleteTask(user.id, workspaceId, taskId),
        'task.deleted'
      )
    }
}

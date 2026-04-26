import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTaskDto } from './dto/task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService, private readonly logger: LoggerService) {}
    
    async createTask (dto: CreateTaskDto, userId) {
        
        this.logger.log(`create task ${dto.title} by ${userId}`, 'Task Service')

        return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {

           const newTask = await tx.task.create({
            data: {
                title: dto.title,
                category: dto.category,
                description: dto.description,
                endDate: dto.endDate,
                priority: dto.priority,
                imageUrl: dto.imageUrl,
                workspaceId: dto.workspaceId
            }
           })
          
           await tx.taskCollaborator.createMany({
             data: dto.collaboratorIds.map((userIds) => ({
                taskId: newTask.id,
                userId: userIds
             }))
           })

           return {newTask: [newTask]}
        })
    }
    
    async getTask(workspaceId: string) {
        this.logger.log(`fetching task list for ${workspaceId}`);
      
        const tasks = await this.prisma.task.findMany({
          where: { workspaceId },
          include: { collaborators: {include: {user: true}}},
        });
      
        if (!tasks.length) {
          throw new NotFoundException('No tasks found');
        }
      
        return tasks;
      }
}

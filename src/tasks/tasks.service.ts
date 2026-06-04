import { ForbiddenException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerService } from 'src/logger/logger.service';
import { Prisma } from '@prisma/client';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService, private readonly logger: LoggerService) {}
    
    async canAccessWorkspace(userId: string, workspaceId: string) {
      
      const workspace = await this.prisma.workspace.findUnique({
        where: {id: workspaceId}
      })

      if(!workspace) {
        throw new UnauthorizedException('Workspace not found.')
      }

      const member = await this.prisma.workspaceMember.findUnique({
        where: {userId_workspaceId: {userId, workspaceId: workspace.id}}
      })

      if(!member) {
        throw new UnauthorizedException('Not a member of workpsace')
      }
   
      return workspace
    }

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
    
    async getTask(workspaceId: string, userId: string) {
        this.logger.log(`fetching task list for ${workspaceId}`);

        const member = await this.prisma.workspace.findFirst({
          where: {
            id: workspaceId,
             members: {some: {userId: userId}}
          },
          include: {members: true}
        });
         
        if (!member) {
          throw new NotFoundException('User is not a member of this workspace');
        }
      
        const tasks = await this.prisma.task.findMany({
          where: { workspaceId },
          include: { collaborators: {include: {user: true}}},
        });
      
        if (!tasks.length) {
          throw new NotFoundException('No tasks found');
        }
      
        return tasks;
      }

      async editTask(
        userId: string,
        workspaceId: string,
        taskId: string,
        dto: UpdateTaskDto,
      ) {
        const task = await this.prisma.task.findFirst({
          where: { workspaceId, id: taskId },
          include: { collaborators: true },
        });
      
        if (!task) {
          throw new NotFoundException('Task not found in this workspace');
        }
      
        const isCollaborator = task.collaborators.some(
          (collab) => collab.userId === userId,
        );
      
        if (!isCollaborator) {
          throw new ForbiddenException('Access Denied.');
        }
      
        const { collaboratorIds, ...rest } = dto;
      
        return this.prisma.task.update({
          where: { id: taskId },
          data: {
            ...rest,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      
            ...(collaboratorIds && {
              collaborators: {
                set: collaboratorIds.map((userId) => ({
                  taskId_userId: {
                    taskId,
                    userId,
                  },
                })),
              },
            }),
          },
        });
      }

      async getTaskDetails (userId: string, workspaceId: string, taskId) {
         const isWorkspaceMemeber = await this.prisma.workspaceMember.findUnique({
          where: {userId_workspaceId: {userId, workspaceId}}
         })

         if(!isWorkspaceMemeber){
          throw new ForbiddenException('Not a member of this workspace')
         }

         const task = this.prisma.task.findUnique({
          where: {id: taskId, workspaceId: workspaceId},
         })

         if(!task) {
          throw new NotFoundException('Task not found.')
         }

         return task
      }
     

    }
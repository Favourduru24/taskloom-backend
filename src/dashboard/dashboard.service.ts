import { Injectable, NotFoundException } from '@nestjs/common';
import { Priority } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
export class DashboardService {

    constructor(private readonly prisma: PrismaService, private readonly taskService: TasksService) {}

    async getWorkspaceStat(userId: string, workspaceId: string) {
 
        const workpsace = await this.taskService.canAccessWorkspace(userId, workspaceId)

         const now = new Date()

         const weekEnd = now.getDay() * 7

         const [ weekEndTaskCompletedCount, weekEndNewTaskCount, weekEndTaskCount] = await Promise.all([
             this.prisma.task.count({where: {priority: Priority.COMPLETED, workspaceId: workpsace.id}}),
             this.prisma.task.count({where: {priority: Priority.TODO, workspaceId: workpsace.id}}),
             this.prisma.task.count({where: {workspaceId: workpsace.id}})
         ])
          

         return {weekEndTaskCompletedCount, weekEndNewTaskCount, weekEndTaskCount}
    }
}

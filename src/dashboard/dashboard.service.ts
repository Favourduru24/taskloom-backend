import { Injectable, NotFoundException } from '@nestjs/common';
import { Priority, ReminderStatus } from '@prisma/client';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
export class DashboardService {

  constructor(private readonly prisma: PrismaService, private readonly taskService: TasksService, private logger: LoggerService) {}

    async getWorkspaceStat(userId: string, workspaceId: string) {
 
        const workspace = await this.taskService.canAccessWorkspace(
            userId,
            workspaceId,
          );
          
          const now = new Date();
          
          const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);
          
          const startOfTomorrow = new Date(startOfToday);
          startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

          const startOfYesterday = new Date(startOfToday);
          startOfYesterday.setDate(startOfYesterday.getDate() - 1);

          const startOfWeek = new Date(now);
          const day = startOfWeek.getDay();

          // Convert Sunday=0 to Monday-based calculation
          const daysFromMonday = day === 0 ? 6 : day - 1;

          startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);
          startOfWeek.setHours(0, 0, 0, 0);

          const startOfNextWeek = new Date(startOfWeek);
          startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
                    
          const [
            todayFollowUpCount,
            yesterdayFollowUpCount,
            upcomingFollowUpCount,
            newTodoTaskCount,
            overdueTasks,
            totalContactCount,
            newContactsThisWeek
          ] = await Promise.all([

            // Today's follow-ups
            this.prisma.reminder.count({
              where: {
                workspaceId: workspace.id,
                status: ReminderStatus.PENDING,
                scheduledFor: {
                  gte: startOfToday,
                  lt: startOfTomorrow,
                },
              },
            }),
            // Yesterday's follow-ups
            this.prisma.reminder.count({
              where: {
                workspaceId: workspace.id,
                status: ReminderStatus.PENDING,
                scheduledFor: {
                  gte: startOfYesterday,
                  lt: startOfToday,
                },
              },
            }),
            // Upcoming follow-ups
            this.prisma.reminder.count({
              where: {
                workspaceId: workspace.id,
                status: ReminderStatus.PENDING,
                scheduledFor: {
                  gte: startOfTomorrow,
                },
              },
            }),
          
            // TODO tasks
            this.prisma.task.count({
              where: {
                workspaceId: workspace.id,
                priority: Priority.TODO,
              },
            }),
            // Overdue tasks
            this.prisma.task.count({
              where: {
                workspaceId: workspace.id,
                endDate: {
                  lt: now
                }
              }
            }),
            // Total contacts
            this.prisma.contact.count({
              where: {
                workspaceId: workspace.id,
                userId,
              },
            }),
             // New contacts this week
            this.prisma.contact.count({
              where: {
                workspaceId: workspace.id,
                userId,
                createdAt: {
                  gte: startOfWeek,
                  lt: startOfNextWeek,
                }
              }
            }),
           ]);
          
          return {
            todayFollowUpCount,
            yesterdayFollowUpCount,
            upcomingFollowUpCount,
            newTodoTaskCount,
            overdueTasks,
            totalContactCount,
            newContactsThisWeek
          };
    }

    async getTodayTask (userId: string, workspaceId: string) {
      this.logger.log('fetching dashboard task task for today')

      const workspace = await this.taskService.canAccessWorkspace(
        userId,
        workspaceId,
      );

      const now = new Date();

      const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);
          
          const startOfTomorrow = new Date(startOfToday);
          startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

          const todayTask = await this.prisma.task.findMany({
            where: {workspaceId: workspace.id, priority: Priority.TODO, createdAt: { gte: startOfToday,
              lt: startOfTomorrow}},
          })

          if(!todayTask) {
            throw new NotFoundException('No Task found.')
          }

          return todayTask
    }

    async getUpCommingFollowup (userId: string, workspaceId: string) {
      this.logger.log('fetching dashboard follow up reminder')

      const workspace = await this.taskService.canAccessWorkspace(
        userId,
        workspaceId,
      );

      const now = new Date();

      const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);
          
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const followUp = this.prisma.reminder.findMany({
        where: {
          workspaceId: workspace.id,
          status: ReminderStatus.PENDING,
          scheduledFor: {
            gte: startOfTomorrow
          },
        },
        include: {contact: true}
      })

       if(!followUp) {
         throw new NotFoundException('No follow up found')
       }

       return followUp
    }
    async getTodayFollowup (userId: string, workspaceId: string) {
      this.logger.log('fetching dashboard follow up reminder')

      const workspace = await this.taskService.canAccessWorkspace(
        userId,
        workspaceId,
      );

      const now = new Date();

      const startOfToday = new Date(now);
          startOfToday.setHours(0, 0, 0, 0);
          
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const todayFollowUp = this.prisma.reminder.findMany({
        where: {
          workspaceId: workspace.id,
          status: ReminderStatus.PENDING,
          scheduledFor: {
            gte: startOfToday,
            lt: startOfTomorrow,
          }},
        include: {contact: true}        
      })

       if(!todayFollowUp) {
         throw new NotFoundException('No follow up found')
       }

       return todayFollowUp
    }





}

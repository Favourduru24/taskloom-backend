import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createContactDto } from './dto/create-contact.dto';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactPriority, ReminderStatus, ReminderType } from '@prisma/client';
import { CreateContactPreferenceDto } from './dto/create-contactpreference.dto';
import { Cron } from '@nestjs/schedule';
import { EventGateway } from 'src/event/event.gateway';
import { scheduleReminder } from 'src/lib/reminder';

interface ConversationAIResponse {
  whoIsThisPerson?:     string | undefined
  relationshipSummary?: string | undefined
  lastPromise?:          string | undefined
  nextAction?:           string| undefined 
  }

@Injectable()
export class ContactsService {

    constructor(
      private readonly logger: LoggerService,
      private readonly prisma: PrismaService, 
      private readonly eventGateway: EventGateway
    ) {}

    async canAccessWorkspace(userId: string, workspaceId: string) {
          
          const workspace = await this.prisma.workspace.findUnique({
            where: {id: workspaceId}
          })
    
          if(!workspace) {
            throw new UnauthorizedException('Workspace not found.')
          }
    
          const member = await this.prisma.workspaceMember.findFirst({
            where: { 
              userId: userId,
              workspaceId: workspace.id 
            }
          });
    
          if(!member) {
            throw new UnauthorizedException('Not a member of workpsace')
          }
       
          return workspace
        }

  
    async createContact(
      dto: createContactDto,
      userId: string,
      workspaceId: string,
    ) {
      this.logger.log(
        `Creating contact ${dto.name} by ${userId}`,
        'Contact Service',
      );

      await this.canAccessWorkspace(userId, workspaceId);

      const contact = await this.prisma.$transaction(async (tx) => {
        // 1. Create the contact
        const newContact = await tx.contact.create({
          data: {
            name: dto.name,
            email: dto.email,
            number: dto.number,
            location: dto.location,
            source: dto.source,
            contactUrl: dto.contactUrl,
            status: dto.status,
            relationshipSummary: dto.relationshipSummary,
            lastContact: new Date(),
            workspaceId,
            userId,
            priority: ContactPriority.ACTIVE,
          },
        });

        // 2. Initialize AI memory
        await tx.aiMemory.create({
          data: {
            whoIsThisPerson: `This is ${dto.name}${dto.source ? `, met through ${dto.source}` : ''}.`,
            relationshipSummary: dto.relationshipSummary || '',
            lastPromise: '',
            nextAction: '',
            contactId: newContact.id,
          },
        });

        return newContact;
      });

      return contact;
    }


   async getContacts (workspaceId: string, userId: string) {
    this.logger.log(`fetching contact list for ${workspaceId}`);

    await this.canAccessWorkspace(userId, workspaceId)

    const contacts = await this.prisma.contact.findMany({
      where: {workspaceId}, //{some: {reminderCadence: true}}
      include: {contactPreference: true},
      orderBy: {createdAt: 'desc'}
    })

     if(!contacts.length) {
       throw new NotFoundException('Contact not found.')
     }

     return contacts
   }

   async getContactDetail (userId: string, workspaceId: string, contactId: string) {
       
    this.logger.log(`fetching contact id:${contactId} for ${workspaceId}`);

    await this.canAccessWorkspace(userId, workspaceId)

    const contact = await this.prisma.contact.findUnique({
      where: {id: contactId, workspaceId}
    })

    if(!contact) {
       throw new NotFoundException('Contact Details not found')
    }

    return contact
   }

   async createContactPreference(
    contactId: string,
    userId: string,
    workspaceId: string,
    dto: CreateContactPreferenceDto,
  ) {
    this.logger.log(
      `create contact preference ${dto.reminderCadence} by ${userId}`,
      'Contact Service',
    );
  
    const owner = await this.prisma.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
    });
  
    if (!owner) {
      throw new UnauthorizedException(
        'Not authorized to create user preference',
      );
    }
  
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the preference
      const contactPreference =
        await tx.contactPreference.create({
          data: {
            time: dto.time,
            timezone: dto.timezone,
            reminderCadence: dto.reminderCadence,
            remindersEnabled: true,
            contactId,
            userId,
          }
        });

      // Create ONE persistent recurring reminder
      await tx.reminder.create({
        data: {
          userId,
          contactId,
          workspaceId,
  
          timezone: dto.timezone ?? 'UTC',
  
          type: ReminderType.RECURRING,
          status: ReminderStatus.PENDING,  
          reminderCadence: dto.reminderCadence,
          scheduledFor: scheduleReminder(
            dto.reminderCadence,
            undefined,
            new Date(),
          ),
          message: `${dto.reminderCadence} follow-up reminder`,
        },
      });
  
      return contactPreference;
    });
  
    return result;
  }

  
  async deleteContactPreference(
    preferenceId: string,
    contactId: string,
    userId: string,
    workspaceId: string,
  ) {

    this.logger.log(`delete contact preference by ${userId}`, 'Contact Service');
  
    // Verify the contact belongs to the authenticated user/workspace
    const owner = await this.prisma.contact.findFirst({
      where: {
        id: contactId,
        workspaceId,
        userId,
      },
    });
  
    if (!owner) {
      throw new UnauthorizedException('Not authorized to delete this contact preference');
    }
  
    // Verify the preference belongs to this contact
    const preference = await this.prisma.contactPreference.findFirst({
      where: {
        id: preferenceId,
        contactId,
      },
    });
  
    if (!preference) {
      throw new NotFoundException(
        'Contact preference not found',
      );
    }
  
    // Delete the preference
    await this.prisma.contactPreference.delete({
      where: {
        id: preferenceId,
      },
    });
  
    return {
      message: 'Contact preference deleted successfully',
    };
  }
   async getContactIdReminderPreference (userId: string, contactId: string) {
       
    this.logger.log(`fetching contact preference id:${contactId}`);

   const owner = await this.prisma.contact.findFirst({
      where: {userId}
    })

    if(!owner) throw new UnauthorizedException('Not Authorize to create user preference')

    const contactPreference = await this.prisma.contactPreference.findUnique({
      where: {userId_contactId: {userId, contactId}}
    })

    if(!contactPreference) {
       throw new NotFoundException('Contact Preference Details not found')
    }

    return contactPreference
   }

   @Cron('* * * * *')
   async handleReminderNotification() {
    this.logger.log(
      'Checking for due reminders...',
      'ReminderService',
    );
  
    const now = new Date();
  
    const oneMinuteFromNow = new Date(
      now.getTime() + 60 * 1000,
    );
  
    try {
      const reminders = await this.prisma.reminder.findMany({
        where: {
          status: ReminderStatus.PENDING,
  
          scheduledFor: {
            lte: oneMinuteFromNow,
          },
        },
  
        include: {
          contact: true,
          
        },
      });
  
      this.logger.log(
        `Found ${reminders.length} reminders to publish`,
        'ReminderService',
      );
  
      for (const reminder of reminders) {
        try {
          // 1. Create notification
          const notification =
            await this.prisma.notification.create({
              data: {
                reminderId: reminder.id,
  
                title: `It's been a while since your last conversation. Reach out to ${reminder.contact.name} to stay connected.`,
  
                body: reminder.message,
  
                userId: reminder.userId,
              },
            });
  
          // 2. Send notification to connected client
          this.eventGateway.emitNotificationCreated(
            reminder.userId,
            notification,
          );
  
          // 3. Handle recurring reminder
          if (reminder.type === ReminderType.RECURRING) {
            if (!reminder.reminderCadence) {
              this.logger.error(
                `Recurring reminder ${reminder.id} has no cadence`,
              );
  
              continue;
            }
  
            const nextScheduledFor = scheduleReminder(
              reminder.reminderCadence,
              undefined,
              reminder.scheduledFor,
            );
  
            await this.prisma.reminder.update({
              where: {
                id: reminder.id,
              },
  
              data: {
                scheduledFor: nextScheduledFor,
              },
            });
  
            this.logger.log(
              `Recurring reminder ${reminder.id} rescheduled for ${nextScheduledFor.toISOString()}`,
            );
          }
  
          // 4. Handle one-time reminder
          else if (reminder.type === ReminderType.ONETIME) {
            await this.prisma.reminder.update({
              where: {
                id: reminder.id,
              },
  
              data: {
                status: ReminderStatus.SENT,
                sentAt: new Date(),
              },
            });
  
            this.logger.log(
              `One-time reminder ${reminder.id} marked as SENT`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to process reminder ${reminder.id}`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Error sending reminder notifications',
        error,
      );
    }
  }

    async getAllNotification(userId: string) {
      this.logger.log(`Fetching notifications for user: ${userId}`);
    
      return this.prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    async deleteNotification(notificationId: string, userId: string) {
      this.logger.log(`Deleting notification by ${userId}`);

      // const owner = await this.prisma.workspace.findFirst({
      //   where: {
      //     userId,
      //   },
      // });
    
      // if (!owner) {
      //   throw new UnauthorizedException('Not authorized to delete this contact preference');
      // }
    
      // Verify the preference belongs to this contact
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
        }
      });
    
      if (!notification) {
        throw new NotFoundException(
          'Notification not found',
        );
      }
    
      // Delete the preference
      await this.prisma.notification.delete({
        where: {
          id: notificationId,
        },
      });
    
      return {
        message: 'Notification deleted successfully',
      };
    }

    async markAllAsRead(userId: string) {
      this.logger.log(`Marking all notifications as read for user: ${userId}`);
    
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
    
      return {updatedCount: result.count}
      
    }
}

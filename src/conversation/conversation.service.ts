import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { scheduleReminder } from 'src/lib/reminder';

@Injectable()
export class ConversationService {

    constructor (private readonly logger: LoggerService, private readonly prisma: PrismaService) {}
    
    async createConversation(
      userId: string,
      contactId: string,
      dto: CreateConversationDto,
    ) {
      this.logger.log(
        `Creating conversation from ${dto.source} by ${userId}`,
        "ConversationService",
      );
    
      // Get reminder preference
      const preference = await this.prisma.contactPreference.findUnique({
        where: {
          userId_contactId: {
            userId,
            contactId,
          },
        },
      });
    
      if (!preference) {
        throw new NotFoundException("Contact preference not found.");
      }
    
      // Cancel existing pending reminders
      await this.prisma.reminder.updateMany({
        where: {
          contactId,
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      });
    
      // Create the conversation
      const conversation = await this.prisma.conversation.create({
        data: {
          contactId,
          content: dto.content,
          source: dto.source,
        },
      });
    
      // Create next reminder
      await this.prisma.reminder.create({
        data: {
          userId,
          contactId,
          conversationId: conversation.id,
          timezone: preference?.timezone ?? "UTC",
          status: "PENDING",
          scheduledFor: scheduleReminder(preference.reminderCadence, undefined, new Date(), 2),
          message: `${preference.reminderCadence} Follow-up Reminder`,
        },
      });
    
      return conversation;
    }
    async fetchUserConversation (user: string, contactId: string) {
          this.logger.log(`fetching conversation list for ${contactId}`);

          const conversation = await this.prisma.conversation.findMany({
            where: {contactId},
            orderBy: {createdAt: 'desc'}
          })
      
           if(!conversation.length) {
             throw new NotFoundException('Contact not found.')
           }
      
           return conversation
    }



}


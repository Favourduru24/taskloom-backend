import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createContactDto } from './dto/create-contact.dto';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactPriority } from '@prisma/client';
import { CreateContactPreferenceDto } from './dto/create-contactpreference.dto';
import { Cron } from '@nestjs/schedule';
import { EventGateway } from 'src/event/event.gateway';

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

    async createContact (dto: createContactDto, userId: string, workspaceId) {
        this.logger.log(`create contact ${dto.name} by ${userId}`, 'Contact Service')
         
        this.canAccessWorkspace(userId, workspaceId)
        
        const newContact = await this.prisma.contact.create({
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
                priority: ContactPriority.ACTIVE
            }
        })
           
        
        return newContact
    }

   async getContacts (workspaceId: string, userId: string) {
    this.logger.log(`fetching contact list for ${workspaceId}`);

    await this.canAccessWorkspace(userId, workspaceId)

    const contacts = await this.prisma.contact.findMany({
      where: {workspaceId},
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

   async createContactPreference(contactId: string, userId: string, dto: CreateContactPreferenceDto) {

    this.logger.log(`create contact preference ${dto.reminderCadence} by ${userId}`, 'Contact Service')
         
    const owner = await this.prisma.contact.findFirst({
      where: {userId}
    })

    if(!owner) throw new UnauthorizedException('Not Authorize to create user preference')
    
    const contactPreference = await this.prisma.contactPreference.create({
        data: {
             time: dto.time,
             timezone: dto.timezone,
             reminderCadence: dto.reminderCadence,
             remindersEnabled: true,
             contactId,
             userId
        }
    })
       
    
    return contactPreference
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

    this.logger.log(`reminder is due --- sending.. notification---`);
    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);

    try {
      const reminders = await this.prisma.reminder.findMany({
        where:{
        status:"PENDING",
        scheduledFor: {lte: oneMinuteFromNow}
      },
        include:{contact: true}
      }
      );
      
      this.logger.log(`Found ${reminders.length} reminders to publish`);

      for(const reminder of reminders){

        const notification = await this.prisma.notification.create({ 
          data: {
          reminderId:reminder.id, 
          title:`Follow up with ${reminder.contact.name}`,
          body: reminder.message,
          userId: reminder.userId
          }});
          
          this.eventGateway.emitNotificationCreated(reminder.userId, notification);
          
          await this.prisma.reminder.update({ where: {id:reminder.id},
             data:{
               status:"SENT",
               sentAt:new Date()}
          });

          }

    } catch (error) {
      console.error('Error sendig reminder notification:', error);
    }}
}

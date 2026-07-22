import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createContactDto } from './dto/create-contact.dto';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContactPriority } from '@prisma/client';

@Injectable()
export class ContactsService {

    constructor(private readonly logger: LoggerService, private readonly prisma: PrismaService) {}

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
}

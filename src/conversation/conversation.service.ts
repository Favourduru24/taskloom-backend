import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationService {

    constructor (private readonly logger: LoggerService, private readonly prisma: PrismaService) {}
    
    async createConversation(userId: string, dto: CreateConversationDto) {
     
        this.logger.log(`create conversation from ${dto.source} by ${userId}`, 'Conversation Service')
                
                const newConversation = await this.prisma.conversation.create({
                    data: {
                       content: dto.content,
                       contactId: dto.contactId,
                       source: dto.source  
                    }
                })
                   
                return newConversation

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


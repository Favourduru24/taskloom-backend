import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { User } from '@prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { handle } from 'src/common/utils/handle';
import { ConversationService } from './conversation.service';
import { LoggerService } from 'src/logger/logger.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateAiMemoryDto } from './dto/update-ai-memory.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversation')
@Auth()
export class ConversationController {
  
    constructor(private readonly logger: LoggerService, private readonly conversationService: ConversationService) {}

    @Post(':workspaceId/:contactId/create')
    @ResponseMessage('Conversation created successfully.')
    async createConversation(@AuthUser() user: User, @Param('contactId') contactId: string, @Param('workspaceId') workspaceId: string, @Body() dto: CreateConversationDto) {
       return handle(
        this.logger,
        () => this.conversationService.createConversation(user.id, contactId, workspaceId, dto),
        'ConversationController.createConversation'
       )
    }

    @Get(':contactId/list')
    @ResponseMessage('fetching user coversation')
    async fetchConversation(@AuthUser() user: User, @Param('contactId') contactId: string) {
         return handle(
            this.logger,
            () => this.conversationService.fetchUserConversation(user.id, contactId),
            'ConversationController.list'
         )
    }

    @Get(':contactId/aimemory')
    @ResponseMessage('fetching user ai Memory')
    async fetchAiMemoryById(@AuthUser() user: User, @Param('contactId') contactId: string) {
          return handle(
             this.logger,
             () => this.conversationService.fetchAiMemoryById(contactId),
             'ConversationController.aimemory'
          )
       }
    @Get(':contactId/:conversationId')
      @ResponseMessage('fetching user coversation')
      async fetchConversationById(@AuthUser() user: User, @Param('contactId') contactId: string, @Param('conversationId') conversationId: string) {
            return handle(
               this.logger,
               () => this.conversationService.fetchConversationById(contactId, conversationId),
               'ConversationController.list'
            )
         }
   
   @Patch(':contactId/ai-memory')
   @ResponseMessage('AI memory updated successfully.')
   async updateAiMemory(
   @AuthUser() user: User,
   @Param('contactId') contactId: string,
   @Body() dto: UpdateAiMemoryDto,
   ) {
   return handle(
      this.logger,
      () =>
         this.conversationService.updateAiMemory(contactId, dto),
      'ConversationController.updateAiMemory',
   );
   }

   @Patch(":contactId/:conversationId/update")
   @ResponseMessage('Conversation updated successfully.')
   async updateConversation(@AuthUser() user: User, @Param('contactId') contactId: string, @Param('conversationId') conversationId: string, @Body() dto: UpdateConversationDto) {
      return handle(
         this.logger,
         () => this.conversationService.updateConversation(conversationId, contactId, dto),
         'ConvesrationController.updateConversation'
      )
   }
}

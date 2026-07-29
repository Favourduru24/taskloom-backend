import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { User } from '@prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { handle } from 'src/common/utils/handle';
import { ConversationService } from './conversation.service';
import { LoggerService } from 'src/logger/logger.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversation')
@Auth()
export class ConversationController {
  
    constructor(private readonly logger: LoggerService, private readonly conversationService: ConversationService) {}

    @Post('create')
    @ResponseMessage('Conversation created successfully.')
    async createConversation(@AuthUser() user: User, @Body() dto: CreateConversationDto) {
       return handle(
        this.logger,
        () => this.conversationService.createConversation(user.id, dto),
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
}

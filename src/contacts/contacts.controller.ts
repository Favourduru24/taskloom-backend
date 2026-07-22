import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { createContactDto } from './dto/create-contact.dto';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import type { User } from '@prisma/client';
import { LoggerService } from 'src/logger/logger.service';
import { handle } from 'src/common/utils/handle';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { ContactsService } from './contacts.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('contacts')
@Auth()

export class ContactsController {

    constructor(private readonly logger: LoggerService, private readonly contactService: ContactsService) {}
    @Post(':workspaceId/create')
       @ResponseMessage('Contact added successfully.')
       async create (@Body() dto: createContactDto, @AuthUser() user: User, @Param('workspaceId') workspaceId: string) {
           return handle(
              this.logger,
              () => this.contactService.createContact(dto, user.id, workspaceId),
              'ContactController.create'
           )
       }

      @Get(':workspaceId/list')
         @ResponseMessage('Contact fetched successfully.')
         async getWorkspaceTask(
           @AuthUser() user: User,
           @Param('workspaceId') workspaceId: string,
         ) {
           return handle(
             this.logger,
             () => this.contactService.getContacts(workspaceId, user.id),
             'ContactController.getContact'
           );
         }

         @Get(':workspaceId/list/:contactId')
         @ResponseMessage('Contact details fetched successfully')
         async ContactDetails(@AuthUser() user: User, @Param('workspaceId') workspaceId: string, @Param('contactId') contactId: string) {
           return handle(
              this.logger,
             () => this.contactService.getContactDetail(user.id, workspaceId, contactId),
             'ContactController.detail'
           )
         }

}

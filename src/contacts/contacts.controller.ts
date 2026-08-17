import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { createContactDto } from './dto/create-contact.dto';
import { AuthUser } from 'src/auth/decorators/user.decorator';
import type { User } from '@prisma/client';
import { LoggerService } from 'src/logger/logger.service';
import { handle } from 'src/common/utils/handle';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { ContactsService } from './contacts.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateContactPreferenceDto } from './dto/create-contactpreference.dto';

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

        @Post(':workspaceId/:contactId/reminder/preference')
        @ResponseMessage('Contact reminder preference created successfully.')
        async createContactPreference(@AuthUser() user: User, @Param('contactId') contactId: string, @Param('workspaceId') workspaceId: string, @Body() dto: CreateContactPreferenceDto) {
           return handle(
            this.logger,
            () => this.contactService.createContactPreference(contactId, user.id, workspaceId, dto)
           )
        }

        @Get(':contactId/preference/list')
         @ResponseMessage('Contact Preference details fetched successfully')
         async ContactPreference(@AuthUser() user: User, @Param('contactId') contactId: string) {
           return handle(
              this.logger,
             () => this.contactService.getContactIdReminderPreference(user.id, contactId),
             'ContactController.detail'
           )
         }

        @Get('/user/notification')
        @ResponseMessage('Notification fetched successfully')
        async getAllNotification(@AuthUser() user: User) {
           return handle(
            this.logger,
            () => this.contactService.getAllNotification(user.id),
            'ContactController.notification'
           )
        }

        @Patch('/user/notification/read-all')
        @ResponseMessage('Notification updated successfully All notifications marked as read.')
        async updateAllNotification(@AuthUser() user: User) {
           return handle(
            this.logger,
            () => this.contactService.markAllAsRead(user.id),
            'ContactController.notification'
           )
        }

}

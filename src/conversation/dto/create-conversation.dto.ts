import { ConversationSource } from "@prisma/client";
import {IsEnum, IsNotEmpty, IsString } from "class-validator";

 export class CreateConversationDto {
    @IsString()
    @IsNotEmpty()
    readonly contactId: string

    @IsEnum(ConversationSource)
    @IsNotEmpty()
    readonly source: ConversationSource;

    @IsString()
    @IsNotEmpty()
    readonly content: string
 }


 
 
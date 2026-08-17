import { IsNotEmpty, IsString } from 'class-validator'; 

export class UpdateConversationDto {
     @IsString()
     @IsNotEmpty()
     content: string;

     @IsString()
     @IsNotEmpty()
     summary: string;
    }
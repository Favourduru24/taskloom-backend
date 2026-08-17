import { IsNotEmpty, IsString } from 'class-validator'; 

export class UpdateAiMemoryDto {
     @IsString()
     @IsNotEmpty()
     recentConversation: string;
    }
import { ReminderCadence } from "@prisma/client"
import { IsEnum, IsOptional, IsString } from "class-validator"

 export class CreateContactPreferenceDto {
     @IsString()
     @IsOptional()
     readonly time?: string    

      @IsEnum(ReminderCadence)
         readonly reminderCadence: ReminderCadence
  
    @IsString()
    readonly timezone: string
 }
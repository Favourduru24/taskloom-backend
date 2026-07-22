import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class createContactDto {
        @IsString()
        @IsNotEmpty()
        readonly name: string;
      
        @IsString()
        @IsNotEmpty()
        @IsEmail()
        readonly email: string;
      
        @IsString()
        readonly number: string;

        @IsString()
        @IsNotEmpty()
        readonly location: string;

        @IsString()
        readonly source: string;

        @IsString()
        readonly status: string;

        @IsString()
        readonly relationshipSummary: string;
    
        @IsString()
        @IsOptional()
        readonly contactUrl: string;
 }

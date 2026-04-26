import { Priority } from '@prisma/client';
import {
    IsArray,
    IsString,
    ArrayNotEmpty,
    ArrayUnique,
    IsOptional,
    IsEnum,
    IsDateString,
    IsNotEmpty,
  } from 'class-validator';
  
  export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    readonly title: string;
  
    @IsString()
    @IsNotEmpty()
    readonly category: string;
  
    @IsString()
    @IsOptional()
    readonly description: string;

    @IsString()
    @IsOptional()
    readonly imageUrl: string;
  
    @IsOptional()
    @IsDateString() // matches DateTime
    readonly endDate?: string;
  
    @IsEnum(Priority)
    readonly priority: Priority;
  
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsString({ each: true })
    readonly collaboratorIds: string[];

    @IsString()
    @IsNotEmpty()
    readonly workspaceId: string;
  }
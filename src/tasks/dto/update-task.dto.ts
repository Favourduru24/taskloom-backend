import { Priority } from '@prisma/client';
import {
    IsArray,
    IsString,
    ArrayUnique,
    IsOptional,
    IsEnum,
    IsDateString,
  } from 'class-validator';
  
  export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    readonly title: string;
  
    @IsString()
    @IsOptional()
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
    @IsOptional()
    readonly priority: Priority;
  
    @IsArray()
    @IsOptional()
    @ArrayUnique()
    @IsString({ each: true })
    readonly collaboratorIds: string[];
  }
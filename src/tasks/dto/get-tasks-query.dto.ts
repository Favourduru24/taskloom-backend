import { Priority } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";

export class GetTaskQueryDto {
    @IsOptional()
    @IsEnum(Priority)
    priority? : Priority
}
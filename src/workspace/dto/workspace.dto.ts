import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";


export class WorkspaceDto {
    @ApiProperty({description: 'Company name'})
    @IsString()
    @Length(1, 50)
    readonly name!: string
}
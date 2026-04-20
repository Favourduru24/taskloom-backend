import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword } from "class-validator";

 
 export class LoginDto {
    @ApiProperty({example: 'durupristine@gmail.com'})
    @IsString()
    @IsEmail()
    readonly email!: string
    
    @ApiProperty({example: 'strongPassword23#'})
    @IsStrongPassword({
        minLowercase: 1,
        minLength: 6,
        minSymbols: 1,
    })
    readonly password!: string
 }
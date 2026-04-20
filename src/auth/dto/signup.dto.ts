import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from "class-validator";

 export class SignupDto {
    @ApiProperty({ example: 'Duru Pristine' })
    @IsString()
    @IsNotEmpty()
    @Length(2, 40)
    readonly fullName!: string
     
    @ApiProperty({ example: 'durupristine@gmail.com' })
    @IsString()
    @IsEmail()
    readonly email!: string
    
    @ApiProperty({ example: 'strongPassword32#' })
    @IsString()
    @IsStrongPassword({
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    readonly password!: string
 }
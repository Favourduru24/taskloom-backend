import { IsEmail, IsString, IsStrongPassword } from "class-validator";

 
 export class LoginDto {
    
    @IsString()
    @IsEmail()
    readonly email!: string

    @IsStrongPassword({
        minLowercase: 1,
        minLength: 6,
        minSymbols: 1,
    })
    readonly password!: string
 }
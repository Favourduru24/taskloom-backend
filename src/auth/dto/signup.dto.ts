import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from "class-validator";

 export class SignupDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 40)
    readonly fullName!: string

    @IsString()
    @IsEmail()
    readonly email!: string

    @IsString()
    @IsStrongPassword({
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    readonly password!: string
 }
import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class AuthService {

    constructor(private readonly prisma: PrismaService){}
    
    async signupUser(dto: SignupDto) {
       
        const {email, fullName, password, } = dto
        
        const normalEmail =  email.toLowerCase()

        const existingUser = await this.prisma.user.findUnique({where: {email: normalEmail}})

        if(existingUser) throw new ConflictException('Email already registered')

        const hashedPassword = await bcrypt.hash(password, 10)

        try {
           await this.prisma.user.create({
                data: {
                    fullName,
                    password: hashedPassword,
                    email: normalEmail
                }
            }) 
        } catch (error) {
           if(error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new ConflictException('Email already registered')
        }

        throw error
    } 

     return {message: 'User sign up successfully.'}
    }
}

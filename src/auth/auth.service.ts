import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { LoggerService } from 'src/logger/logger.service';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';

type IssueContext = {
  userAgent?: string;
  ipAddress?: string;
  device?: string;
  sessionIdToUpdate?: string;
};

@Injectable()
export class AuthService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService
     ){}
    
    async signupUser(dto: SignupDto) {
       
        const {email, fullName, password, } = dto
        
        const normalEmail =  email.toLowerCase()
        this.logger.log(`signup:start email=${email}`)

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
     
    this.logger.log(`signup:done email=${email}`)
     return {message: 'User sign up successfully.'}
    }

    async login(dto: LoginDto, ctx: IssueContext) {  
       const {email, password} = dto

       const normalEmail = email.toLowerCase()

       const user = await this.prisma.user.findUnique({
        where: {email: normalEmail}
       })

       if(!user) throw new UnauthorizedException('Invalid Credentials') 

        this.logger.log('user found', 'Auth Service')

        let passwordValid = false

        try {
             if(!user?.password) {
                 this.logger.error(`loginWeb:no-password userId=${user.id} email=${email}`)
                 throw new UnauthorizedException('Invalid Credentials')
                }

              passwordValid = await bcrypt.compare(user?.password, password)
              
        } catch (error) {
            this.logger.error(`bcrypt-error error=${(error as Error).message}`, 'login');
            throw new UnauthorizedException('Invalid credentials');
        }

        if(!passwordValid) {
            this.logger.warn(`invalid-password`, 'login');
            throw new UnauthorizedException('Invalid Password recieved.')
        }

        const tokens = await this.issueTokens(user.id, ctx);

      this.logger.log(`loginWeb:done userId=${user.id}`);
     return tokens;
    }

    private issueTokens (userId: string, ctx?: IssueContext, tx?: Prisma.TransactionClient) {
       
        const db = tx || this.prisma

        
    }
}

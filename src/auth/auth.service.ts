import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { LoggerService } from 'src/logger/logger.service';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto';
import { AppConfiguration } from 'src/config/app.config';
import type { ConfigType } from '@nestjs/config';
import { AuthConfiguration } from 'src/config/auth.config';

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
        private readonly logger: LoggerService,
        @Inject(AppConfiguration.KEY)
        private readonly appCfg: ConfigType<typeof AppConfiguration>,
        @Inject(AuthConfiguration.KEY)
        private readonly authCfg: ConfigType<typeof AuthConfiguration>
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

       this.logger.log(`login:start email=${email}`, 'auth-service');

       const normalEmail = email.toLowerCase()

       const user = await this.prisma.user.findUnique({
        where: {email: normalEmail}
       })

       if(!user) throw new UnauthorizedException('Invalid Credentials') 

        if(!user?.password) {
                 this.logger.error(`loginWeb:no-password userId=${user.id} email=${email}`)
                 throw new UnauthorizedException('Invalid Credentials')
                }

        this.logger.log('login: user-found', 'Auth Service')

        let passwordValid = false

        try {
              passwordValid = await bcrypt.compare(password, user?.password)
              
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

    private async issueTokens (userId: string, ctx?: IssueContext, tx?: Prisma.TransactionClient) {
       
        const db = tx || this.prisma
        const issuer = this.appCfg.apiBaseUrl
        const audience = this.appCfg.clientBaseUrl

        const jti = randomUUID()

        const accessToken = jwt.sign(
            {sub: userId},
            this.authCfg.accessTokenSecret,
             {
                 algorithm:'HS256',
                 expiresIn: this.authCfg.accessTokenTtl,
                 issuer,
                 audience,
             }
        )

        const refreshToken = jwt.sign(
            {sub: userId, jti},
            this.authCfg.refreshTokenSecret,
            {
            algorithm: 'HS256',
            expiresIn: this.authCfg.refreshTokenTtl,
            issuer,
            audience
            }
        )

        const decoded = jwt.decode(refreshToken) as {exp: number; jti: string}

        if(!decoded) {
            throw new Error('Failed to decode refresh token')
        }

        const createdRt = await db.refreshToken.create({
            data: {
                userId,
                jti,
                tokenHash: await bcrypt.hash(refreshToken, 10),
                expiresAt: new Date(decoded.exp * 1000)
            }
        })

        if(ctx?.sessionIdToUpdate) {
            await db.loginSession.update({
                where: {id: ctx.sessionIdToUpdate},
                data: {
             refreshTokenId: createdRt.id,
             jti,
             lastSeenAt: new Date(),
             userAgent: ctx.userAgent,
             ipAddress: ctx.ipAddress,
             device: ctx.device       
                }
            })
        } else {
          await db.loginSession.create({
            data: {
              userId,
              refreshTokenId: createdRt.id,
              jti,
              userAgent: ctx?.userAgent,
              ipAddress: ctx?.ipAddress,
              device: ctx?.device  
            }
          })
        }

        this.logger.log(`issueTokens`, 'Auth service')
        return {accessToken, refreshToken}
    }
}

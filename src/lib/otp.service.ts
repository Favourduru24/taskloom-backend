import { Injectable } from "@nestjs/common";
import {randomInt} from 'crypto'
import bcrypt from 'bcrypt'
import { PrismaService } from "src/prisma/prisma.service";
import { EmailService } from "./email.service";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
 export class OtpService {

    constructor(private readonly prisma: PrismaService, private readonly email: EmailService, private readonly logger: LoggerService){}
  
    async sendOtp(email: string) {
      const normalEmail = email.toLowerCase()
      const code = (randomInt(0, 1_000_000)
       + '').padStart(6, '0')
       const codeHashed = await bcrypt.hash(code, 10)
       const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

       await this.prisma.otp.upsert({
        where: {email: normalEmail},
        update: {code: codeHashed, expiresAt, createdAt: new Date()},
        create: {email: normalEmail, code: codeHashed, expiresAt}
       })

       this.logger.log(`OTP generated for ${normalEmail} expires: ${expiresAt.toISOString()}`);

       await this.email.sendOtpEmail(normalEmail, code)

       return code
    }
}
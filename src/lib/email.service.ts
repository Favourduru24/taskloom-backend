import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { MailerSendConfiguration } from "src/config/mail.config";
import { LoggerService } from "src/logger/logger.service";

    type SendParams = {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string | string[];
    idempotencyKey?: string;
    tags?: Record<string, string>;
    };

 Injectable()
 export class EmailService {
  private readonly mailerSend?: MailerSend
     
    constructor(
      private readonly logger: LoggerService,
      @Inject(MailerSendConfiguration.KEY)
        private readonly emailFg: ConfigType<typeof MailerSendConfiguration>
    ){
        console.log('Api-key', this.emailFg.fromName)
        if(this.emailFg.apiKey) {
            this.mailerSend = new MailerSend({
                apiKey: this.emailFg.apiKey
          })
        } else {
            this.logger.warn('MAILERSEND_API_KEY missing')
        }
    }
     
     
   private async send(params: SendParams) {
      if(!this.mailerSend) {
        this.logger.log(`email to=${params.to} subject=${params.subject}`, 'email service')
        return 
    }

    const {tags, idempotencyKey, ...rest} = params

    try {
        const sentFrom = new Sender(this.emailFg.from, this.emailFg.fromName)
       
        const recipients = Array.isArray(rest.to) ? rest.to.map(email => new Recipient(email)) : [new Recipient(rest.to)]

        const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(rest.subject)
        .setHtml(rest.html)

         if(rest.text) {
            emailParams.setText(rest.text)
         }

         if(rest.replyTo) {
        const replyToEmails = Array.isArray(rest.replyTo) ? rest.replyTo : [rest.replyTo]

        emailParams.setReplyTo(new Recipient(replyToEmails[0]))
         }

         if(tags) {
            const tagArray = Object.entries(tags).map(([key, value]) => `${key}:${value}`);

            emailParams.setTags(tagArray)
         }
        
         this.logger.debug(`sending email from: ${this.emailFg.from} to: ${params.to}`)

         const response = await this.mailerSend.email.send(emailParams)

         this.logger.log(`Email sent successfully to: ${params.to} statusCode=${response.statusCode}`, 'Email Service')

    } catch (error: any) {
        if (error?.body) {
        const errorBody = typeof error.body === 'string' ? error.body : JSON.stringify(error.body);
        this.logger.error(
          `MailerSend API error (${error.statusCode}): ${errorBody}`,
        );
      } else {
        // Standard error object
        this.logger.error(
          `MailerSend error: ${error?.message || JSON.stringify(error)}`,
          error?.stack || '',
        );
      }

      throw error
    }

   }

   async sendOtpEmail(to: string, otp: string) {
    return this.send({
        to,
        subject: 'Your Verification code',
        html: `<h1>Your Verification Code</h1><p>Use this code to verify your email:</p> <pre style='font-size:20px; font-weight:bold'>${otp}</pre>`,
        text: `Your verification code: ${otp}`,
        idempotencyKey: `otp:${to}:${otp}`,
        tags: {category: 'auth', type: 'otp'}
    });
   }
   
 }
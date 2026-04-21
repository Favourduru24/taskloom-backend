import { Module } from "@nestjs/common";
import { LoggerModule } from "src/logger/logger.module";
import { EmailService } from "./email.service";
import { ConfigModule } from "@nestjs/config";
import { MailerSendConfiguration } from "src/config/mail.config";


@Module({
 providers: [EmailService],
 exports: [EmailService],
 imports: [LoggerModule, ConfigModule.forFeature(MailerSendConfiguration)]
})

export class EmailModule {}
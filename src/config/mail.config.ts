import { registerAs } from "@nestjs/config";

export interface MailerSendConfig {
    apiKey: string;
    from: string;
    fromName: string;
}

export const MailerSendConfiguration = registerAs(
    'mailersend',
    (): MailerSendConfig => ({
        apiKey: process.env.MAILERSEND_API_KEY ?? '',
        from: process.env.MAILERSEND_FROM ?? 'no-reply@example.com',
        fromName: process.env.MAILERSEND_FROM_NAME ?? 'Taskloom'
    })
)
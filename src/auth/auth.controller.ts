import { Body, Controller, Post, Req } from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { handle } from 'src/common/utils/handle';
import { LoggerService } from 'src/logger/logger.service';
import { AuthDocs } from 'src/docs/auth';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
      private readonly authService: AuthService,
      private readonly logger: LoggerService
    )
     {}
    
    @AuthDocs.signUp()
    @Post('signup')
    @ResponseMessage('Sign up has been successful, please verify your email')
    singUp (@Body() dto: SignupDto) {
      return handle(
        this.logger,
        () => this.authService.signupUser(dto),
        'AuthController.signup'
      )
    }

    @AuthDocs.login()
    @Post('login')
    @ResponseMessage('Login successfully.')
    login(@Req() req: Request, @Body() dto: LoginDto) {
        return handle (
           this.logger,
           () => this.authService.login(dto, {userAgent: req.headers['user-agent'] as string | undefined, ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip}),
           'AuthController.login'
        )
    }
}

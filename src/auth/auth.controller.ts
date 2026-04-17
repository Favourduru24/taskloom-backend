import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @ResponseMessage('Sign up has been successful, please verify your email')
    singUp (@Body() dto: SignupDto) {
      return this.authService.signupUser(dto), 'AuthController.signup'
    }
}

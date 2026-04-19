import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "src/auth/dto/login.dto";
import { SignupDto } from "src/auth/dto/signup.dto";
import { createdResponseExample, successResponseExample } from "src/common/utils/handle";

const tokenPairExample = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token',
};

export const AuthDocs = {
    controller: () => applyDecorators(ApiTags('auth')),
    signUp: () => applyDecorators(
        applyDecorators(
      ApiOperation({ summary: 'Create account' }),
      ApiExtraModels(SignupDto),
      ApiBody({ type: SignupDto }),
      ApiCreatedResponse({
        description: 'Account created',
        schema: {
          example: createdResponseExample(
            { message: 'OTP sent', otp: '123456' },
            'Signup successful, please verify your email.',
          ),
        },
      }),
    ),
     ),
     login: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Login',
        description: 'Login with email/password. If 2FA is enabled, returns requiresTwoFactor=true instead of tokens.',
      }),
      ApiExtraModels(LoginDto),
      ApiBody({ type: LoginDto }),
      ApiOkResponse({
        description: 'Login successful or 2FA required',
        schema: {
          example: successResponseExample(
            tokenPairExample,
            'Login successful.',
          ),
        },
      }),
    )
}
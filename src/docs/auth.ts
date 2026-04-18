import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SignupDto } from "src/auth/dto/signup.dto";
import { createdResponseExample } from "src/common/utils/handle";


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
     )
}
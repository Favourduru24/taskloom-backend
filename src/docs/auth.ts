import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";


export const AuthDocs = {
    controller: () => applyDecorators(ApiTags('auth')),
    signUp: () => applyDecorators(
        ApiOperation({summary: 'Create Account'})
     )
}
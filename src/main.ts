import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from './logger/logger.service';
import {BadRequestException, HttpStatus, ValidationPipe} from '@nestjs/common'
import { formatValidationIssues } from './common/utils/validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

   app.useLogger(app.get(LoggerService))
   app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const issues = formatValidationIssues(errors);
        return new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: issues,
          error: 'Bad Request',
        });
      },
    })
   )
   
  const config = new DocumentBuilder()
  .setTitle('Taskloom')
  .setDescription('Taskloom an project management application.')
  .setVersion('1.0')
  // .addBearerAuth()
  .build()

   const documentLibary = () => SwaggerModule.createDocument(app, config)
   SwaggerModule.setup('api', app, documentLibary)

  await app.listen(process.env.PORT ?? 3000); 
}
bootstrap();

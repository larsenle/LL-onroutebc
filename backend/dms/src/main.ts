import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http.filter';
import { FallbackExceptionFilter } from './common/filters/fallback.filter';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { BadRequestExceptionDto } from './common/exception/badRequestException.dto';
import { ExceptionDto } from './common/exception/exception.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (e) => {
        const badRequestExceptionList: BadRequestExceptionDto[] = [];
        e.forEach((error) => {
          const badRequestExceptionDto = new BadRequestExceptionDto();
          badRequestExceptionDto.field = error.children[0]
            ? error.property.concat('.', error.children[0]?.property.toString())
            : error.property;
          badRequestExceptionDto.message = Object.values(
            error.children[0]
              ? error.children[0].constraints
              : error.constraints,
          );
          badRequestExceptionList.push(badRequestExceptionDto);
        });
        const exceptionDto = new ExceptionDto(
          HttpStatus.BAD_REQUEST,
          'Bad Request',
          badRequestExceptionList,
        );
        throw new BadRequestException(exceptionDto);
      },
      forbidUnknownValues: true,
      validationError: { target: false },
    }),
  );
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('DMS API')
    .setDescription('The Data Management System API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  app.useGlobalFilters(
    new FallbackExceptionFilter(),
    new HttpExceptionFilter(),
  );

  await app.listen(5001);
}
void bootstrap();
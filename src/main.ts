import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from './common/pipes/parse-int-id.pipe';
import { ErrorHandlingInterceptor } from './common/interceptors/error-handling.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove chave que não estão no dto
      forbidNonWhitelisted: true, // levantar erro quando a chave não existir
      transform: true, // tenta transformar os tipos de dados de param e dtos
    }),
    new ParseIntIdPipe(),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';

export default (appConfiguration: INestApplication) => {
  appConfiguration.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove chave que não estão no dto
      forbidNonWhitelisted: true, // levantar erro quando a chave não existir
      transform: true, // tenta transformar os tipos de dados de param e dtos
    }),
    new ParseIntIdPipe(),
  );
};

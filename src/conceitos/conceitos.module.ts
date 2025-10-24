import { Module } from '@nestjs/common';
import { ConceitosService } from './conceitos.service';
import { ConceitosController } from './conceitos.controller';

@Module({
  controllers: [ConceitosController],
  providers: [ConceitosService],
})
export class ConceitosModule {}

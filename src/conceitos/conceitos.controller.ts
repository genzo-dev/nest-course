import { Controller } from '@nestjs/common';
import { ConceitosService } from './conceitos.service';

@Controller('conceitos')
export class ConceitosController {
  constructor(private readonly conceitosService: ConceitosService) {}
}

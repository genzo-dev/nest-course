import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe implements PipeTransform<any, any> {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }

    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      throw new BadRequestException('Param ID is not a string');
    }

    if (parsedValue < 0) {
      throw new BadRequestException(
        'ParsedIntIdPip espera um número maior do que zero',
      );
    }

    return parsedValue;
  }
}

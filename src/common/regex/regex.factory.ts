import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { RemoveSpacesRegex } from './remove-spaces.regex';

import { RegexProtocol } from './regex.protocol';
import { OnlyLowerCaseRegex } from './only-lower-case.regex';

export type ClassNames = 'OnlyLowercaseLettersRegex' | 'RemoveSpacesRegex';

@Injectable()
export class RegexFactory {
  create(className: ClassNames): RegexProtocol {
    // Meu código/lógica

    switch (className) {
      case 'OnlyLowercaseLettersRegex':
        return new OnlyLowerCaseRegex();

      case 'RemoveSpacesRegex':
        return new RemoveSpacesRegex();

      default:
        throw new InternalServerErrorException(
          `No class found for ${className}`,
        );
    }
  }
}

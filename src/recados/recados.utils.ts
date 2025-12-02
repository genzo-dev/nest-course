import { Injectable } from '@nestjs/common';

@Injectable()
export class RecadosUtils {
  inverteString(str: string) {
    str.split('').reverse().join('');
  }
}

@Injectable()
export class RecadosUtilsMock {
  inverteString() {
    return 'bla bla bla';
  }
}

import { RegexProtocol } from './regex.protocol';

export class OnlyLowerCaseRegex implements RegexProtocol {
  execute(str: string): string {
    return str.replace(/[^a-z]/g, '');
  }
}

import crypto from 'crypto';

export class KeyGenerator {
  static generate(message: string): string {
    const hash = crypto.createHash('sha512').update(message).digest();
    const base64 = hash.toString('base64');
    return base64.slice(0, 6);
  }
}

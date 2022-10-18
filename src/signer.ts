import { base64decode, base64encode } from "./deps.ts";

const encoder = new TextEncoder();

export class Signer {
  private constructor(
    private key: CryptoKey,
    private algorithm: HmacImportParams,
  ) {}

  static async createInstance(secretKey: string) {
    const algorithm: HmacImportParams = { name: "HMAC", hash: "SHA-256" };
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      algorithm,
      false,
      ["sign", "verify"],
    );

    return new Signer(key, algorithm);
  }

  async sign(data: string) {
    const signature = await crypto.subtle.sign(
      this.algorithm.name,
      this.key,
      encoder.encode(data),
    );

    return base64encode(signature);
  }

  verify(signature: string, data: string) {
    return crypto.subtle.verify(
      this.algorithm.name,
      this.key,
      base64decode(signature),
      encoder.encode(data),
    );
  }
}

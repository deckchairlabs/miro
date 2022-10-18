import { base64decode, base64encode } from "./deps.ts";
import { ImageURL } from "./image.ts";

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

  async sign(url: ImageURL) {
    const signature = await crypto.subtle.sign(
      this.algorithm.name,
      this.key,
      encoder.encode(url.toString()),
    );

    const encodedSignature = base64encode(signature);
    return "/" + encodedSignature + url.toString();
  }

  verify(url: ImageURL) {
    if (!url.signature) {
      throw new Error("Cannot verify an ImageURL without a signature.");
    }

    return crypto.subtle.verify(
      this.algorithm.name,
      this.key,
      base64decode(url.signature),
      encoder.encode(url.toString()),
    );
  }
}

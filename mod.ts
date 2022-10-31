import { createRequestHandler } from "./src/handler.ts";
import { ImageURL } from "./src/image.ts";
import { Operation } from "./src/operations.ts";
import { Signer } from "./src/signer.ts";

type CreateMiroOptions = {
  secretKey?: string;
  pathPrefix?: string;
  baseUrl?: string;
  allowedOrigins?: URLPatternInit[];
};

export async function createMiro(options: CreateMiroOptions) {
  const {
    secretKey,
    baseUrl,
    pathPrefix = "/",
    allowedOrigins,
  } = options;

  const signer = secretKey ? await Signer.createInstance(secretKey) : undefined;

  async function encode(href: string | URL, operations: Operation[] = []) {
    const image = new ImageURL(href, operations);
    const path = signer
      ? await signer.sign(image)
      : `/insecure${image.toString()}`;

    return `${pathPrefix}${path}`;
  }

  const handleRequest = createRequestHandler({
    signer,
    baseUrl,
    pathPrefix,
    allowedOrigins,
  });

  return {
    handleRequest,
    encode,
  };
}

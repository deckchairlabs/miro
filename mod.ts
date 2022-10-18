import { base64encode } from "./src/deps.ts";
import { createRequestHandler } from "./src/handler.ts";
import { encode, Operation } from "./src/operations.ts";
import { Signer } from "./src/signer.ts";

type CreateMiroOptions = {
  secretKey: string;
  pathPrefix?: string;
  baseUrl?: string;
  remotePatterns?: URLPatternInit[];
};

export async function createMiro(options: CreateMiroOptions) {
  const {
    secretKey,
    baseUrl,
    pathPrefix = "/",
    remotePatterns,
  } = options;

  const signer = await Signer.createInstance(secretKey);

  async function sign(sourceUrl: string, operations: Operation[] = []) {
    const encodedSourceUrl = base64encode(sourceUrl);
    const encodedOperations = operations.map(encode).join(",");
    const path = `/${encodedOperations}/${encodedSourceUrl}`;
    const signature = await signer.sign(path);

    return `${pathPrefix}/${signature}${path}`;
  }

  const handleRequest = createRequestHandler({
    verify: signer.verify,
    baseUrl,
    pathPrefix,
    remotePatterns,
  });

  return {
    handleRequest,
    sign,
  };
}

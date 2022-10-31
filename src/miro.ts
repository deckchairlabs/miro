import {
  createRequestHandler,
  CreateRequestHandlerOptions,
} from "./handler.ts";
import { ImageURL } from "./image.ts";
import { Operation } from "./operations.ts";
import { Signer } from "./signer.ts";

type CreateMiroOptions = Omit<CreateRequestHandlerOptions, "signer"> & {
  secretKey?: string;
};

export async function createMiro(options: CreateMiroOptions = {}) {
  const {
    secretKey,
    pathPrefix = "/",
  } = options;

  const signer = secretKey ? await Signer.createInstance(secretKey) : undefined;

  async function encode(href: string, operations: Operation[] = []) {
    const url = new ImageURL(href, operations);
    const image = signer ? await signer.sign(url) : url;
    const path = image.toString();
    const prefix = pathPrefix === "/" && path.startsWith("/") ? "" : pathPrefix;

    return `${prefix}${path}`;
  }

  const handleRequest = createRequestHandler(options);

  return {
    handleRequest,
    encode,
  };
}

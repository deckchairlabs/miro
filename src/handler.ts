import { instantiate, Pipeline } from "../lib/miro.generated.js";
import { apply } from "./operations.ts";
import { ImageURL } from "./image.ts";
import { Signer } from "./signer.ts";

export type MiroOptions = {
  secretKey: string;
  baseUrl?: string;
  pathPrefix?: string;
  allowedOrigins?: URLPatternInit[];
};

type CreateRequestHandlerOptions = {
  signer?: Signer;
  baseUrl?: string;
  pathPrefix?: string;
  allowedOrigins?: URLPatternInit[];
  allowInsecure?: boolean;
};

export function createRequestHandler(
  options: CreateRequestHandlerOptions,
) {
  const {
    signer,
    baseUrl = import.meta.url,
    pathPrefix = "/miro",
    allowedOrigins = [],
    allowInsecure = false,
  } = options;

  return async function requestHandler(
    request: Request,
  ): Promise<Response | undefined> {
    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname.replace(pathPrefix, "");

    // Verify the incomming request
    const image = ImageURL.decode(pathname);

    // If we have a signer, unsigned URL's are not allowed
    if (allowInsecure === false && !image.signature && signer) {
      throw new Error("Insecure URLs are not allowed.");
    }

    const shouldVerify = signer !== undefined;
    const verified = shouldVerify === false ||
      shouldVerify && await signer.verify(image);

    if (!verified) {
      throw new Error("Signature verification failed.");
    }

    const isRemoteSource = image.href.startsWith("http");
    const sourceUrl = isRemoteSource
      ? new URL(image.href)
      : new URL(image.href, baseUrl);

    // Check remote source is allowed
    const isAllowedRemote = allowedOrigins.some((pattern) =>
      new URLPattern(pattern).test(sourceUrl)
    );

    if (isRemoteSource && !isAllowedRemote) {
      throw new Error(`Remote source is not allowed ${sourceUrl}.`);
    }

    await instantiate();

    const response = await fetch(sourceUrl.href);
    const source = await response.arrayBuffer();

    const pipeline = apply(image.operations, new Pipeline());
    const transformed = pipeline.execute(new Uint8Array(source));

    const headers = new Headers();
    headers.set("cache-control", "public, max-age=604800, immutable");
    headers.set(
      "x-miro-content-length",
      response.headers.get("content-length")!,
    );

    return new Response(transformed, {
      status: 200,
      headers,
    });
  };
}

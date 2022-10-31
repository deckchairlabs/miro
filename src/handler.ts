import { instantiate, Pipeline } from "../lib/miro.generated.js";
import { apply } from "./operations.ts";
import { ImageURL } from "./image.ts";
import { Signer } from "./signer.ts";

export type CreateRequestHandlerOptions = {
  signer?: Signer;
  cache?: Cache;
  baseUrl?: string;
  pathPrefix?: string;
  allowedOrigins?: URLPatternInit[];
  allowInsecure?: boolean;
};

export function createRequestHandler(
  options: CreateRequestHandlerOptions = {},
) {
  const {
    signer,
    cache,
    baseUrl,
    pathPrefix = "/miro",
    allowedOrigins = [],
    allowInsecure = false,
  } = options;

  return async function requestHandler(
    request: Request,
  ): Promise<Response | undefined> {
    const cached = cache && await cache.match(request);

    if (cached) {
      cached.headers.set("x-miro-cache", "hit");
      return cached;
    }

    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname.replace(pathPrefix, "");

    // Decode the incoming image request
    const image = ImageURL.decode(pathname);

    // If we have a signer, unsigned URL's are not allowed
    if (allowInsecure === false && !image.signature && signer) {
      throw new Error("Insecure URLs are not allowed.");
    }

    // Verify the image request if needed
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
      throw new Error(
        `Remote image did not match an allowedOrigin ${sourceUrl}.`,
      );
    }

    await instantiate();

    const fetched = await fetch(sourceUrl.href);
    const source = await fetched.arrayBuffer();
    const shouldCache = cache !== undefined &&
      (fetched.ok && fetched.status === 200);

    const pipeline = apply(image.operations, new Pipeline());
    const transformed = pipeline.execute(new Uint8Array(source));

    const headers = new Headers();
    headers.set("cache-control", "public, max-age=604800, immutable");
    headers.set("x-miro-content-length", String(source.byteLength));
    headers.set("x-miro-cache", "miss");

    const response = new Response(transformed, {
      status: 200,
      headers,
    });

    if (shouldCache) {
      await cache.put(request, response.clone());
    }

    return response;
  };
}

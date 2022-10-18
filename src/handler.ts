import { instantiate, Pipeline } from "../lib/miro.generated.js";
import { base64decode, typeByExtension } from "./deps.ts";
import { notEmpty } from "./utils.ts";
import { apply, decode } from "./operations.ts";

export type MiroOptions = {
  secretKey: string;
  baseUrl?: string;
  pathPrefix?: string;
  remotePatterns?: URLPatternInit[];
};

type CreateRequestHandlerOptions = {
  verify(signature: string, path: string): Promise<boolean>;
  baseUrl?: string;
  pathPrefix?: string;
  remotePatterns?: URLPatternInit[];
};

export function createRequestHandler(
  options: CreateRequestHandlerOptions,
) {
  const {
    verify,
    baseUrl = import.meta.url,
    pathPrefix = "/miro",
    remotePatterns,
  } = options;

  const patterns = [
    `/:signature/:encodedOperations/{:encodedSourceUrl}{.:extension}?`,
    `/:signature/{:encodedSourceUrl}{.:extension}?`,
  ].map((pathname) => new URLPattern({ pathname }));

  return async function requestHandler(
    request: Request,
  ): Promise<Response | undefined> {
    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname.replace(pathPrefix, "");

    const matchedPattern = patterns.find((pattern) =>
      pattern.test({ pathname })
    );

    if (!matchedPattern) {
      return;
    }

    const match = matchedPattern.exec({ pathname })!;

    const {
      signature,
      encodedOperations,
      encodedSourceUrl,
      extension,
    } = match.pathname.groups;

    // Verify the signature
    const pathSegments = [encodedOperations, encodedSourceUrl].filter(notEmpty);
    const path = `/${pathSegments.join("/")}${
      extension ? `.${extension}` : ""
    }`;

    const verified = await verify(signature, path);
    const decodedSourceUrl = new TextDecoder().decode(
      base64decode(encodedSourceUrl),
    );

    const isRemoteSource = decodedSourceUrl.startsWith("http");
    const sourceUrl = isRemoteSource
      ? new URL(decodedSourceUrl)
      : new URL(decodedSourceUrl, baseUrl);

    // Check remote source is allowed
    const isAllowedRemote = remotePatterns?.some((pattern) =>
      new URLPattern(pattern).test(sourceUrl)
    );

    if (isRemoteSource && !isAllowedRemote) {
      throw new Error("Remote source is not allowed.");
    }

    if (!verified) {
      throw new Error("Signature verification failed.");
    }

    await instantiate();

    const operations = encodedOperations.split(",").map(decode).filter(
      notEmpty,
    );
    const pipeline = apply(operations, new Pipeline());
    const contentType = typeByExtension(extension);

    const source = await fetch(sourceUrl.href).then((response) =>
      response.arrayBuffer()
    );

    const transformed = pipeline.execute(new Uint8Array(source));

    const headers = new Headers();
    headers.set("content-type", contentType!);
    headers.set("cache-control", "public, max-age=604800, immutable");

    return new Response(transformed, {
      status: 200,
      headers,
    });
  };
}

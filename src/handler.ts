import { instantiate } from "../lib/miro.generated.js";
import { base64decode } from "./deps.ts";
import { importKey, verify } from "./signature.ts";

type MiroOptions = {
  secretKey: string;
  baseUrl?: string;
  pathPrefix?: string;
  allowOrigin?: string[];
};

export async function miro(options: MiroOptions) {
  const {
    secretKey,
    baseUrl = import.meta.url,
    pathPrefix = "/miro",
    allowOrigin = [],
  } = options;

  const signingKey = await importKey(secretKey);

  const pattern = new URLPattern({
    pathname:
      `${pathPrefix}/:signature/:operations/{:encodedSourceUrl}{.:extension}?`,
  });

  return async function requestHandler(
    request: Request,
  ): Promise<Response | undefined> {
    const requestUrl = new URL(request.url);
    const match = pattern.exec({
      pathname: requestUrl.pathname,
    });

    if (!match) {
      return;
    }

    const {
      signature,
      operations,
      encodedSourceUrl,
      extension,
    } = match.pathname.groups;

    // Verify the signature
    const path = `/${operations}/${encodedSourceUrl}`;
    const verified = await verify(signingKey, signature, path);

    if (!verified) {
      throw new Error("Signature verification failed.");
    }

    await instantiate();

    const decodedSourceUrl = new TextDecoder().decode(
      base64decode(encodedSourceUrl),
    );

    const sourceUrl = decodedSourceUrl.startsWith("http")
      ? new URL(decodedSourceUrl)
      : new URL(decodedSourceUrl, baseUrl);

    console.log(sourceUrl.href);

    return new Response("hello", {
      status: 200,
      headers: {
        // "cache-control": "public, max-age=604800, immutable",
      },
    });
  };
}

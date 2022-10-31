import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { createRequestHandler } from "./handler.ts";
import { ImageURL } from "./image.ts";
import { Signer } from "./signer.ts";

const signer = await Signer.createInstance("secret");

function createImageRequest(image: ImageURL) {
  return new Request(new URL(image.toString(), "http://localhost"));
}

async function createSignedImageRequest(url: string) {
  const image = await signer.sign(new ImageURL(url));
  return createImageRequest(image);
}

function createInsecureImageRequest(url: string) {
  const image = new ImageURL(url);
  return createImageRequest(image);
}

Deno.test("it can handle insecure requests with a remote origin", async () => {
  const handler = createRequestHandler({
    allowedOrigins: [{
      hostname: "www.placecage.com",
    }],
  });

  const request = createInsecureImageRequest(
    "https://www.placecage.com/500/500",
  );

  const response = await handler(request);

  assertEquals(response?.status, 200);
  assertEquals(response?.body instanceof ReadableStream, true);
  assertEquals(response?.headers.has("cache-control"), true);
  assertEquals(response?.headers.has("x-miro-content-length"), true);
});

Deno.test("it can handle signed requests with a remote origin", async () => {
  const handler = createRequestHandler({
    allowedOrigins: [{
      hostname: "www.placecage.com",
    }],
  });

  const request = await createSignedImageRequest(
    "https://www.placecage.com/500/500",
  );

  const response = await handler(request);

  assertEquals(response?.status, 200);
  assertEquals(response?.body instanceof ReadableStream, true);
  assertEquals(response?.headers.has("cache-control"), true);
  assertEquals(response?.headers.has("x-miro-content-length"), true);
});

import { join, toFileUrl } from "https://deno.land/std@0.159.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { createRequestHandler } from "./handler.ts";
import { ImageURL } from "./image.ts";
import { Operation } from "./operations.ts";
import { Signer } from "./signer.ts";

const signer = await Signer.createInstance("secret");

function createImageRequest(image: ImageURL) {
  return new Request(new URL(image.toString(), "http://localhost"));
}

async function createSignedImageRequest(url: string, operations?: Operation[]) {
  const image = await signer.sign(new ImageURL(url, operations));
  return createImageRequest(image);
}

function createInsecureImageRequest(url: string, operations?: Operation[]) {
  const image = new ImageURL(url, operations);
  return createImageRequest(image);
}

function createLocalImageRequest(url: string, operations?: Operation[]) {
  const image = new ImageURL(toFileUrl(join(Deno.cwd(), url)).href, operations);
  return createImageRequest(image);
}

Deno.test("it can handle insecure requests with a local origin", async () => {
  const handler = createRequestHandler({
    allowedOrigins: [{
      hostname: "www.placecage.com",
    }],
  });

  const request = createLocalImageRequest(
    "./test/miro.jpg",
    [{
      name: "resize",
      width: 100,
    }],
  );

  const response = await handler(request);

  assertEquals(response?.status, 200);
  assertEquals(response?.body instanceof ReadableStream, true);
  assertEquals(response?.headers.has("cache-control"), true);
  assertEquals(response?.headers.has("x-miro-content-length"), true);
});

Deno.test("it can handle insecure requests with a remote origin", async () => {
  const handler = createRequestHandler({
    allowedOrigins: [{
      hostname: "www.placecage.com",
    }],
  });

  const request = createInsecureImageRequest(
    "https://www.placecage.com/500/500",
    [{
      name: "resize",
      width: 100,
    }],
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

Deno.test("it can handle requests with a cache", async () => {
  const cacheName = "v1";
  await caches.delete(cacheName);
  const cache = await caches.open(cacheName);

  const handler = createRequestHandler({
    cache,
    allowedOrigins: [{
      hostname: "www.placecage.com",
    }],
  });

  const request = await createSignedImageRequest(
    "https://www.placecage.com/500/500",
  );

  const response = await handler(request);

  assertEquals(response?.status, 200);
  assertEquals(response?.headers.get("x-miro-cache"), "miss");

  const response2 = await handler(request);

  assertEquals(response2?.status, 200);
  assertEquals(response2?.headers.get("x-miro-cache"), "hit");

  await response2?.arrayBuffer();
});

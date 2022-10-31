import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { resolveBestSupportedFormat } from "./format.ts";

Deno.test("it resolves the best supported format from a request and response", () => {
  const request = new Request("http://localhost/image.jpg", {
    headers: {
      "accept":
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });

  const png = new Response("", {
    headers: {
      "content-type": "image/png",
    },
  });

  const jpeg = new Response("", {
    headers: {
      "content-type": "image/jpeg",
    },
  });

  assertEquals(resolveBestSupportedFormat(request, png), {
    format: "png",
    contentType: "image/png",
  });

  assertEquals(resolveBestSupportedFormat(request, jpeg), {
    format: "jpg",
    contentType: "image/jpeg",
  });
});

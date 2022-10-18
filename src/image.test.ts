import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { Signer } from "./signer.ts";
import { ImageURL } from "./image.ts";

Deno.test("it can create an ImageURL with operations", () => {
  const url = new ImageURL(new URL("https://www.placecage.com/500/500"))
    .resize(100, 100)
    .crop(0, 0, 200);

  assertEquals(url.href, "https://www.placecage.com/500/500");
  assertEquals(url.operations.length, 2);

  assertEquals(
    url.toString(),
    "/resize:100:100,crop:0:0:200:200/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );
});

Deno.test("it can create an ImageURL without operations", () => {
  const url = new ImageURL(new URL("https://www.placecage.com/500/500"));

  assertEquals(url.href, "https://www.placecage.com/500/500");
  assertEquals(url.operations.length, 0);

  assertEquals(
    url.toString(),
    "/plain/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );
});

Deno.test("it can create an ImageURL from a signed path", async () => {
  const signer = await Signer.createInstance("secret");
  const image = ImageURL.fromSigned(
    "/UZfCh_VH8kH5zuIGb_iLLjPsT3elYXp3ssYA1IXuvvg/resize:100:100,crop:0:0:200:200/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );

  assertEquals(image.href, "https://www.placecage.com/500/500");
  assertEquals(image.operations.length, 2);
  assertEquals(image.signature, "UZfCh_VH8kH5zuIGb_iLLjPsT3elYXp3ssYA1IXuvvg");
  assertEquals(await signer.verify(image), true);
});

Deno.test("it can create an ImageURL from an unsigned path", async () => {
  const signer = await Signer.createInstance("secret");
  const image = ImageURL.fromUnsigned(
    "/insecure/resize:100:100,crop:0:0:200:200/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );

  assertEquals(image.href, "https://www.placecage.com/500/500");
  assertEquals(image.operations.length, 2);
  assertEquals(image.signature, undefined);
  assertThrows(() => signer.verify(image));
});

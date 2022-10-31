import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { Signer } from "./signer.ts";
import { ImageURL } from "./image.ts";

const signer = await Signer.createInstance("secret");

Deno.test("it can create an ImageURL with operations", async () => {
  const unsigned = new ImageURL("https://www.placecage.com/500/500")
    .resize(100, 100)
    .crop(0, 0, 200);

  assertEquals(unsigned.href, "https://www.placecage.com/500/500");
  assertEquals(unsigned.operations.length, 2);

  assertEquals(
    unsigned.toString(),
    "/insecure/resize:100:100,crop:0:0:200:200/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );

  const signed = await signer.sign(unsigned);
  assertEquals(
    signed.toString(),
    "/guL0BvU74XYBrf07IjKjS8rppH2ButPUaMAhx8GI9yA/resize:100:100,crop:0:0:200:200/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );
});

Deno.test("it can create an encoded ImageURL without operations", async () => {
  const unsigned = new ImageURL("https://www.placecage.com/500/500");

  assertEquals(unsigned.href, "https://www.placecage.com/500/500");
  assertEquals(unsigned.operations.length, 0);

  assertEquals(
    unsigned.toString(),
    "/insecure/raw/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );

  const signed = await signer.sign(unsigned);
  assertEquals(
    signed.toString(),
    "/sQDtPcMRblE15LAWFAU6PMyvCzoF2eiwIf6ty-b5vgM/raw/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );
});

Deno.test("it can create an encoded ImageURL without operations", async () => {
  const unsigned = new ImageURL("https://www.placecage.com/500/500");

  assertEquals(unsigned.href, "https://www.placecage.com/500/500");
  assertEquals(unsigned.operations.length, 0);

  assertEquals(
    unsigned.toString(),
    "/insecure/raw/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );

  const signed = await signer.sign(unsigned);
  assertEquals(
    signed.toString(),
    "/sQDtPcMRblE15LAWFAU6PMyvCzoF2eiwIf6ty-b5vgM/raw/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );
});

Deno.test("it can create an ImageURL from a signed encoded url", async () => {
  const image = ImageURL.decode(
    "/guL0BvU74XYBrf07IjKjS8rppH2ButPUaMAhx8GI9yA/resize:100:100,crop:0:0:200:200/aHR0cHM6Ly93d3cucGxhY2VjYWdlLmNvbS81MDAvNTAw",
  );

  assertEquals(image.href, "https://www.placecage.com/500/500");
  assertEquals(image.operations.length, 2);
  assertEquals(image.signature, "guL0BvU74XYBrf07IjKjS8rppH2ButPUaMAhx8GI9yA");
  assertEquals(await signer.verify(image), true);
});

Deno.test("it can create an ImageURL from a signed plain url", async () => {
  const image = ImageURL.decode(
    "/guL0BvU74XYBrf07IjKjS8rppH2ButPUaMAhx8GI9yA/resize:100:100,crop:0:0:200:200/plain/https://www.placecage.com/500/500",
  );

  assertEquals(image.href, "https://www.placecage.com/500/500");
  assertEquals(image.operations.length, 2);
  assertEquals(image.signature, "guL0BvU74XYBrf07IjKjS8rppH2ButPUaMAhx8GI9yA");
  assertEquals(await signer.verify(image), true);
});

Deno.test("it can create an ImageURL from an unsigned path", () => {
  const image = ImageURL.decode(
    "/insecure/resize:100:100,crop:0:0:200:200/plain/https://www.placecage.com/500/500",
  );

  assertEquals(image.href, "https://www.placecage.com/500/500");
  assertEquals(image.operations.length, 2);
  assertEquals(image.signature, undefined);
  assertThrows(() => signer.verify(image));
});

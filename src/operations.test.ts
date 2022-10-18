import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { decode, encode } from "./operations.ts";

Deno.test("it can decode operations", () => {
  assertEquals(decode("rs:100:100"), {
    name: "resize",
    width: 100,
    height: 100,
  });

  assertEquals(decode("resize:100:200"), {
    name: "resize",
    width: 100,
    height: 200,
  });

  assertEquals(decode("c:0:0:100:100"), {
    name: "crop",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  assertEquals(decode("crop:0:0:100:200"), {
    name: "crop",
    x: 0,
    y: 0,
    width: 100,
    height: 200,
  });
});

Deno.test("it can encode operations", () => {
  assertEquals(
    encode({
      name: "resize",
      width: 100,
    }),
    "resize:100:100",
  );

  assertEquals(
    encode({
      name: "resize",
      width: 100,
      height: 200,
    }),
    "resize:100:200",
  );
});

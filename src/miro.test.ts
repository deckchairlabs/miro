import { assertEquals } from "https://deno.land/std@0.159.0/testing/asserts.ts";
import { createMiro } from "./miro.ts";

Deno.test("it can encode signed urls", async () => {
  const miro = await createMiro({
    secretKey: "secret",
  });

  assertEquals(
    await miro.encode("https://placecage.com/500/500", [{
      name: "resize",
      width: 100,
    }]),
    "/Kb1iTbWmmmGQTK-Mr2RORjzGLribRknI1Z7mlRYPKl8/resize:100:100/aHR0cHM6Ly9wbGFjZWNhZ2UuY29tLzUwMC81MDA",
  );
});

Deno.test("it can encode unsigned urls", async () => {
  const miro = await createMiro();

  assertEquals(
    await miro.encode("https://placecage.com/500/500", [{
      name: "resize",
      width: 100,
    }]),
    "/insecure/resize:100:100/aHR0cHM6Ly9wbGFjZWNhZ2UuY29tLzUwMC81MDA",
  );
});

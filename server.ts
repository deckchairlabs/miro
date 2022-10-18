import { serve } from "https://deno.land/std@0.159.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v2.2.5/mod.ts";
import { createMiro } from "./mod.ts";

const app = new Hono();

const secretKey =
  "943b421c9eb07c830af81030552c86009268de4e532ba2ee2eab8247c6da0881";

const miro = await createMiro({
  baseUrl: import.meta.url,
  secretKey,
  pathPrefix: "/miro",
  remotePatterns: [{
    protocol: "https",
    hostname: "www.placecage.com",
  }],
});

const pathname = await miro.sign("https://www.placecage.com/500/500");

console.log(`http://localhost:8000${pathname}`);

app.get("/miro/*", (context) => miro.handleRequest(context.req));

serve(app.fetch);

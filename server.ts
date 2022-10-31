import { serve } from "https://deno.land/std@0.161.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v2.3.2/mod.ts";
import { createMiro } from "./mod.ts";

const app = new Hono();

const secretKey =
  "943b421c9eb07c830af81030552c86009268de4e532ba2ee2eab8247c6da0881";

const miro = await createMiro({
  baseUrl: import.meta.url,
  secretKey,
  pathPrefix: "/miro",
  allowedOrigins: [{
    hostname: "www.placecage.com",
  }],
});

const encoded = await miro.encode("https://www.placecage.com/500/500", [{
  name: "resize",
  width: 100,
}]);

app.get("/", (context) => {
  return context.html(`
    <img src="${encoded}" />
  `);
});

app.get("/miro/*", (context) => miro.handleRequest(context.req));

serve(app.fetch);

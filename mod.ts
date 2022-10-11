import { instantiate, Picasso } from "./lib/picasso.generated.js";

await instantiate();

const resize = new URLPattern({
  pathname: ":op(rs|resize){\\::width}{\\::height}?",
});

const crop = new URLPattern({
  pathname: ":op(c|crop){\\::x}{\\::y}{\\::width}{\\::height}?",
});

const operations = [resize, crop];

// console.log(resize.exec({ pathname: "resize:100" }));
// console.log(crop.exec({ pathname: "crop:0:0:100" }));

const pattern = new URLPattern({
  pathname: "/:signature/:processingOptions/{:sourceUrl(.+)}",
});

const match = pattern.exec({
  pathname: "/1234567890/resize:100:100,crop:0:0:100/testing.png",
});

const signature = match?.pathname.groups.signature;
const processingOptions = match?.pathname.groups.processingOptions;

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

const buffer = await fetch("https://via.placeholder.com/1000.png").then(
  (response) => response.arrayBuffer(),
);

type ParsedOperation = [name: string, args: Record<string, string>];

if (processingOptions) {
  let image = new Picasso(new Uint8Array(buffer));

  const options = processingOptions.split(",");

  const parsedOperations = options.flatMap((option) =>
    operations.filter((operation) => operation.test({ pathname: option })).map(
      (operation): ParsedOperation | undefined => {
        const groups = operation.exec({ pathname: option })?.pathname.groups;
        if (groups) {
          const { op, ...args } = groups;
          return [op, args];
        }
      },
    )
  ).filter(notEmpty);

  // TODO: order the operations
  for (const operation of parsedOperations) {
    const [name, args] = operation;
    switch (name) {
      case "resize":
      case "rs":
        image = image.resize(
          Number(args.width),
          Number(args.height || args.width),
        );
    }
  }

  await Deno.writeFile("resized.png", image.write());
}

// // import { instantiate, Picasso } from "./lib/picasso.generated.js";

// // await instantiate();

// // export function picasso() {
// //   return function middleware(request: Request) {
// //     console.log(request.url);
// //   };
// // }

// // const middleware = picasso();

// // const request = new Request(new URL("/image/test.png", import.meta.url));
// // middleware(request);

// // // const buffer = await fetch("https://via.placeholder.com/1000.png").then(
// // //   (response) => response.arrayBuffer(),
// // // );

// // // const image = new Picasso(new Uint8Array(buffer));
// // // console.time("resize");
// // // const processed = image.resize(100, 100).convert("jpeg");
// // // console.timeEnd("resize");

// // // await Deno.writeFile("resized.jpg", processed.write());

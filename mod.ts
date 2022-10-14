import { instantiate } from "./lib/miro.generated.js";

type MiroOptions = {
  prefix?: string;
};

export function miro(options: MiroOptions = {}) {
  const { prefix = "/miro" } = options;

  const pattern = new URLPattern({
    pathname: `${prefix}/:signature/:processingOptions/{:sourceUrl(.+)}`,
  });

  return async function middleware(
    request: Request,
  ): Promise<Response | undefined> {
    const requestUrl = new URL(request.url);
    const match = pattern.exec({ pathname: requestUrl.pathname });

    if (!match) {
      return;
    }

    await instantiate();

    console.log(match);

    return new Response("hello", {
      status: 200,
      headers: {
        "cache-control": "",
      },
    });
  };
}

const middleware = miro();

await middleware(
  new Request(
    new URL(
      "http://example.com/miro/1234567890/resize:100:100,crop:0:0:100/fixture/testing.png",
    ),
  ),
);

// const buffer = await fetch("https://via.placeholder.com/1000.png").then(
//   (response) => response.arrayBuffer(),
// );

// const pipeline = new Pipeline()
//   .resize(100, 100)
//   .crop(50, 50, 10, 10)
//   .convert("jpeg");

// console.time("execute");
// const image = pipeline.execute(new Uint8Array(buffer));
// console.timeEnd("execute");
// await Deno.writeFile("resized.png", image);

// export class Miro {
//   pipeline: Pipeline;

//   constructor() {
//     this.pipeline = new Pipeline();
//   }

//   resize(width: number, height?: number) {
//     this.pipeline.resize(width, height || width);

//     return this;
//   }

//   crop(x: number, y: number, width: number, height?: number) {
//     this.pipeline.crop(x, y, width, height || width);

//     return this;
//   }
// }

// // const resize = new URLPattern({
// //   pathname: ":op(rs|resize){\\::width}{\\::height}?",
// // });

// // const crop = new URLPattern({
// //   pathname: ":op(c|crop){\\::x}{\\::y}{\\::width}{\\::height}?",
// // });

// // const operations = [resize, crop];

// // // console.log(resize.exec({ pathname: "resize:100" }));
// // // console.log(crop.exec({ pathname: "crop:0:0:100" }));

// // const pattern = new URLPattern({
// //   pathname: "/:signature/:processingOptions/{:sourceUrl(.+)}",
// // });

// // const match = pattern.exec({
// //   pathname: "/1234567890/resize:100:100,crop:0:0:100/testing.png",
// // });

// // const signature = match?.pathname.groups.signature;
// // const processingOptions = match?.pathname.groups.processingOptions;

// // function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
// //   return value !== null && value !== undefined;
// // }

// // const buffer = await fetch("https://via.placeholder.com/1000.png").then(
// //   (response) => response.arrayBuffer(),
// // );

// // type ParsedOperation = [name: string, args: Record<string, string>];

// // if (processingOptions) {
// //   let image = new Picasso(new Uint8Array(buffer));

// //   console.time("process");
// //   const options = processingOptions.split(",");

// //   const parsedOperations = options.flatMap((option) =>
// //     operations.filter((operation) => operation.test({ pathname: option })).map(
// //       (operation): ParsedOperation | undefined => {
// //         const groups = operation.exec({ pathname: option })?.pathname.groups;
// //         if (groups) {
// //           const { op, ...args } = groups;
// //           return [op, args];
// //         }
// //       },
// //     )
// //   ).filter(notEmpty);

// //   // TODO: order the operations
// //   for (const operation of parsedOperations) {
// //     const [name, args] = operation;
// //     switch (name) {
// //       case "resize":
// //       case "rs":
// //         image = image.resize(
// //           Number(args.width),
// //           Number(args.height || args.width),
// //         );
// //     }
// //   }
// //   console.timeEnd("process");

// //   await Deno.writeFile("resized.png", image.write());
// // }

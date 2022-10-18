import { Pipeline } from "../lib/miro.generated.js";
import { notEmpty } from "./utils.ts";

export type ResizeOperation = {
  name: "resize" | "rs";
  width: number;
  height?: number;
};

export type CropOperation = {
  name: "crop" | "c";
  x: number;
  y: number;
  width: number;
  height?: number;
};

export type Operation = ResizeOperation | CropOperation;

const resize = ":name(rs|resize){\\::width}{\\::height}";
const crop = ":name(c|crop){\\::x}{\\::y}{\\::width}{\\::height}";

const patterns = [
  resize,
  crop,
].map((pathname) => new URLPattern({ pathname }));

export function decode(value: string): Operation | undefined {
  const pattern = patterns.find((pattern) => pattern.test({ pathname: value }));
  if (!pattern) {
    return;
  }

  const groups = pattern.exec({ pathname: value })?.pathname.groups;

  if (groups) {
    const { name, ...args } = groups;
    switch (name) {
      case "rs":
      case "resize": {
        const width = Number(args.width);
        const height = Number(args.height || width);
        return { name: "resize", width, height };
      }
      case "c":
      case "crop": {
        const x = Number(args.x);
        const y = Number(args.y);
        const width = Number(args.width);
        const height = Number(args.height || width);
        return { name: "crop", x, y, width, height };
      }
    }
  }
}

export function encode(op: Operation) {
  switch (op.name) {
    case "rs":
    case "resize":
      return [op.name, op.width, op.height].filter(notEmpty).join(":");
    case "c":
    case "crop":
      return [op.name, op.x, op.y, op.width, op.height].filter(notEmpty).join(
        ":",
      );
  }
}

export function apply(operations: Required<Operation>[], pipeline: Pipeline) {
  for (const operation of operations) {
    switch (operation.name) {
      case "rs":
      case "resize":
        pipeline = pipeline.resize(operation.width, operation.height);
        break;
      case "c":
      case "crop":
        pipeline = pipeline.crop(
          operation.x,
          operation.y,
          operation.width,
          operation.height,
        );
        break;
    }
  }

  return pipeline;
}

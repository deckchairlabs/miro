import { decode, encode, type Operation } from "./operations.ts";
import { base64decode, base64encode } from "./deps.ts";
import { notEmpty } from "./utils.ts";

const securePattern = new URLPattern({
  pathname: "/:signature/:encodedOperations/{:encodedHref}{.:format}?",
});

const insecurePattern = new URLPattern({
  pathname: "/insecure/:encodedOperations/{:encodedHref}{.:format}?",
});

export class ImageURL {
  public href: string;
  readonly operations: Operation[] = [];

  constructor(
    href: string | URL,
    operations: Operation[] = [],
    public format?: string,
    public signature?: string,
  ) {
    this.href = String(href);
    this.operations = operations;
  }

  static fromSigned(signed: string) {
    const groups = securePattern.exec({ pathname: signed })?.pathname.groups;

    if (!groups) {
      throw new Error(`Failed to create ImageURL from ${signed}`);
    }

    return imageUrlFromPatternMatchGroups(groups as PatternMatchGroups);
  }

  static fromUnsigned(unsigned: string) {
    const groups =
      insecurePattern.exec({ pathname: unsigned })?.pathname.groups;

    if (!groups) {
      throw new Error(`Failed to create ImageURL from ${unsigned}`);
    }

    return imageUrlFromPatternMatchGroups(groups as PatternMatchGroups);
  }

  resize(width: number, height?: number) {
    height = height ?? width;
    this.operations.push({ name: "resize", width, height });

    return this;
  }

  crop(x: number, y: number, width: number, height?: number) {
    height = height ?? width;
    this.operations.push({ name: "crop", x, y, width, height });

    return this;
  }

  toString(): string {
    const operations = this.operations.length > 0
      ? this.operations.map(encode).join(",")
      : undefined;

    const pathname = [operations ?? "plain", base64encode(this.href)].join("/");

    return "/" + pathname;
  }
}

type PatternMatchGroups = {
  signature?: string;
  encodedOperations: string;
  encodedHref: string;
  format?: string;
};

export function imageUrlFromPatternMatchGroups(groups: PatternMatchGroups) {
  const href = new TextDecoder().decode(base64decode(groups.encodedHref));
  const operations = groups.encodedOperations.split(",").map(decode).filter(
    notEmpty,
  );

  return new ImageURL(href, operations, groups.format, groups.signature);
}

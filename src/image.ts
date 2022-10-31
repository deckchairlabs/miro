import { decode, encode, type Operation } from "./operations.ts";
import { base64decode, base64encode } from "./deps.ts";
import { notEmpty } from "./utils.ts";

const securePattern = new URLPattern({
  pathname: "/:signature/:operations/{:href(.+?)}{.:format}?",
});

const insecurePattern = new URLPattern({
  pathname: "/insecure/:operations/{:href(.+?)}{.:format}?",
});

export class ImageURL {
  public href: string;
  readonly operations: Operation[] = [];

  constructor(
    href: string,
    operations: Operation[] = [],
    public format?: string,
    public signature?: string,
  ) {
    this.href = href;
    this.operations = operations;
  }

  static signed(image: ImageURL, signature: string) {
    return new ImageURL(image.href, image.operations, image.format, signature);
  }

  static decode(pathname: string) {
    const isInsecure = pathname.startsWith("/insecure");

    const groups = isInsecure
      ? insecurePattern.exec({ pathname })?.pathname.groups
      : securePattern.exec({ pathname })?.pathname.groups;

    if (!groups) {
      throw new Error(`Failed to decode ImageURL from ${pathname}`);
    }

    const href = groups.href.startsWith("plain/")
      ? groups.href.slice(6)
      : new TextDecoder().decode(base64decode(groups.href));

    const operations = groups.operations.split(",").map(decode).filter(
      notEmpty,
    );

    return new ImageURL(href, operations, groups.format, groups.signature);
  }

  encode() {
    const operations = this.operations.length > 0
      ? this.operations.map(encode).join(",")
      : undefined;

    const href = base64encode(this.href);
    const format = this.format ? [".", this.format].join("") : "";
    const encoded = [operations ?? "raw", href + format].join("/");

    return encoded;
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
    const encoded = this.encode();

    return "/" +
      [this.signature || "insecure", encoded].filter(notEmpty).join("/");
  }
}

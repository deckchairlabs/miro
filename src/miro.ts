import { Pipeline } from "../lib/miro.generated.js";

export class Miro {
  pipeline: Pipeline;

  constructor() {
    this.pipeline = new Pipeline();
  }

  resize(width: number, height?: number) {
    this.pipeline.resize(width, height || width);

    return this;
  }

  crop(x: number, y: number, width: number, height?: number) {
    this.pipeline.crop(x, y, width, height || width);

    return this;
  }

  process(image: Uint8Array) {
    return this.pipeline.execute(image);
  }
}

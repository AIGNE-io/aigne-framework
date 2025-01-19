export class TextDecoderStream extends TransformStream<ArrayBuffer, string> {
  private decoder = new TextDecoder();

  constructor() {
    super({
      transform: (chunk, controller) => {
        controller.enqueue(this.decoder.decode(chunk, { stream: true }));
      },
      flush: (controller) => {
        controller.enqueue(this.decoder.decode());
      },
    });
  }
}

// Bun is not support TextDecoderStream https://github.com/oven-sh/bun/issues/5648
globalThis.TextDecoderStream = TextDecoderStream as any;

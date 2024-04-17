// text-encoding.d.ts
declare module TextEncoding {
    interface TextDecoderStatic {
      new(label?: string, options?: TextDecoderOptions): TextDecoder;
    }
  
    interface TextEncoderStatic {
      new(): TextEncoder;
    }
  }
  
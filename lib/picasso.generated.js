// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file
// source-hash: 735db2d6a9a98d974d6da04f1d6ac8110f667e54
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

let heap_next = heap.length;

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8Memory0 = new Uint8Array();

function getUint8Memory0() {
  if (cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

const cachedTextEncoder = new TextEncoder("utf-8");

const encodeString = function (arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
};

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length);
    getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len);

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3);
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachedInt32Memory0 = new Int32Array();

function getInt32Memory0() {
  if (cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}

const cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let stack_pointer = 32;

function addBorrowedObject(obj) {
  if (stack_pointer == 1) throw new Error("out of js stack");
  heap[--stack_pointer] = obj;
  return stack_pointer;
}

const PicassoFinalization = new FinalizationRegistry((ptr) =>
  wasm.__wbg_picasso_free(ptr)
);
/** */
export class Picasso {
  static __wrap(ptr) {
    const obj = Object.create(Picasso.prototype);
    obj.ptr = ptr;
    PicassoFinalization.register(obj, obj.ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.ptr;
    this.ptr = 0;
    PicassoFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_picasso_free(ptr);
  }
  /**
   * @param {any} value
   */
  constructor(value) {
    try {
      const ret = wasm.picasso_new(addBorrowedObject(value));
      return Picasso.__wrap(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }
  /**
   * @param {number} width
   * @param {number} height
   * @returns {Picasso}
   */
  resize(width, height) {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.picasso_resize(ptr, width, height);
    return Picasso.__wrap(ret);
  }
  /**
   * @param {any} format
   * @returns {Picasso}
   */
  convert(format) {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.picasso_convert(ptr, addHeapObject(format));
    return Picasso.__wrap(ret);
  }
  /**
   * @returns {Uint8Array}
   */
  write() {
    const ptr = this.__destroy_into_raw();
    const ret = wasm.picasso_write(ptr);
    return takeObject(ret);
  }
}

const imports = {
  __wbindgen_placeholder__: {
    __wbg_new_abda76e883ba8a5f: function () {
      const ret = new Error();
      return addHeapObject(ret);
    },
    __wbg_stack_658279fe44541cf6: function (arg0, arg1) {
      const ret = getObject(arg1).stack;
      const ptr0 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len0;
      getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    },
    __wbg_error_f851667af71bcfc6: function (arg0, arg1) {
      try {
        console.error(getStringFromWasm0(arg0, arg1));
      } finally {
        wasm.__wbindgen_free(arg0, arg1);
      }
    },
    __wbindgen_object_drop_ref: function (arg0) {
      takeObject(arg0);
    },
    __wbg_new_8c3f0052272a457a: function (arg0) {
      const ret = new Uint8Array(getObject(arg0));
      return addHeapObject(ret);
    },
    __wbg_length_9e1ae1900cb0fbd5: function (arg0) {
      const ret = getObject(arg0).length;
      return ret;
    },
    __wbindgen_memory: function () {
      const ret = wasm.memory;
      return addHeapObject(ret);
    },
    __wbg_buffer_3f3d764d4747d564: function (arg0) {
      const ret = getObject(arg0).buffer;
      return addHeapObject(ret);
    },
    __wbg_set_83db9690f9353e79: function (arg0, arg1, arg2) {
      getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    },
    __wbindgen_string_get: function (arg0, arg1) {
      const obj = getObject(arg1);
      const ret = typeof (obj) === "string" ? obj : undefined;
      var ptr0 = isLikeNone(ret)
        ? 0
        : passStringToWasm0(
          ret,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
      var len0 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len0;
      getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    },
    __wbg_newwithbyteoffsetandlength_d9aa266703cb98be: function (
      arg0,
      arg1,
      arg2,
    ) {
      const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    },
    __wbindgen_throw: function (arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
  },
};

/**
 * Decompression callback
 *
 * @callback DecompressCallback
 * @param {Uint8Array} compressed
 * @return {Uint8Array} decompressed
 */

/**
 * Options for instantiating a Wasm instance.
 * @typedef {Object} InstantiateOptions
 * @property {URL=} url - Optional url to the Wasm file to instantiate.
 * @property {DecompressCallback=} decompress - Callback to decompress the
 * raw Wasm file bytes before instantiating.
 */

/** Instantiates an instance of the Wasm module returning its functions.
 * @remarks It is safe to call this multiple times and once successfully
 * loaded it will always return a reference to the same object.
 * @param {InstantiateOptions=} opts
 */
export async function instantiate(opts) {
  return (await instantiateWithInstance(opts)).exports;
}

let instanceWithExports;
let lastLoadPromise;

/** Instantiates an instance of the Wasm module along with its exports.
 * @remarks It is safe to call this multiple times and once successfully
 * loaded it will always return a reference to the same object.
 * @param {InstantiateOptions=} opts
 * @returns {Promise<{
 *   instance: WebAssembly.Instance;
 *   exports: { Picasso : typeof Picasso  }
 * }>}
 */
export function instantiateWithInstance(opts) {
  if (instanceWithExports != null) {
    return Promise.resolve(instanceWithExports);
  }
  if (lastLoadPromise == null) {
    lastLoadPromise = (async () => {
      try {
        const instance = (await instantiateModule(opts ?? {})).instance;
        wasm = instance.exports;
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
        instanceWithExports = {
          instance,
          exports: getWasmInstanceExports(),
        };
        return instanceWithExports;
      } finally {
        lastLoadPromise = null;
      }
    })();
  }
  return lastLoadPromise;
}

function getWasmInstanceExports() {
  return { Picasso };
}

/** Gets if the Wasm module has been instantiated. */
export function isInstantiated() {
  return instanceWithExports != null;
}

/**
 * @param {InstantiateOptions} opts
 */
async function instantiateModule(opts) {
  const wasmUrl = opts.url ?? new URL("picasso_bg.wasm", import.meta.url);
  const decompress = opts.decompress;
  switch (wasmUrl.protocol) {
    case "file:":
    case "https:":
    case "http:": {
      const isFile = wasmUrl.protocol === "file:";
      if (isFile) {
        if (typeof Deno !== "object") {
          throw new Error("file urls are not supported in this environment");
        }
        if ("permissions" in Deno) {
          await Deno.permissions.request({ name: "read", path: wasmUrl });
        }
      } else if (typeof Deno === "object" && "permissions" in Deno) {
        await Deno.permissions.request({ name: "net", host: wasmUrl.host });
      }
      const wasmResponse = await fetch(wasmUrl);
      if (decompress) {
        const wasmCode = new Uint8Array(await wasmResponse.arrayBuffer());
        return WebAssembly.instantiate(decompress(wasmCode), imports);
      }
      if (
        isFile ||
        wasmResponse.headers.get("content-type")?.toLowerCase()
          .startsWith("application/wasm")
      ) {
        return WebAssembly.instantiateStreaming(wasmResponse, imports);
      } else {
        return WebAssembly.instantiate(
          await wasmResponse.arrayBuffer(),
          imports,
        );
      }
    }
    default:
      throw new Error(`Unsupported protocol: ${wasmUrl.protocol}`);
  }
}

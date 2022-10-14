use convert::ConvertOperation;
use js_sys::Uint8Array;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

use crate::{
  convert::SupportedImageFormat, crop::CropOperation, resize::ResizeOperation,
};

mod convert;
mod crop;
mod resize;

#[wasm_bindgen]
#[derive(Default)]
pub struct Pipeline {
  resize: Option<ResizeOperation>,
  crop: Option<CropOperation>,
  convert: Option<ConvertOperation>,
}

#[wasm_bindgen]
impl Pipeline {
  #[wasm_bindgen(constructor)]
  pub fn new() -> Pipeline {
    console_error_panic_hook::set_once();
    Pipeline {
      resize: None,
      crop: None,
      convert: None,
    }
  }

  pub fn resize(mut self, width: u32, height: u32) -> Self {
    self.resize = Some(ResizeOperation::new(width, height, None));
    self
  }

  pub fn crop(mut self, x: u32, y: u32, width: u32, height: u32) -> Self {
    self.crop = Some(CropOperation::new(x, y, width, height));
    self
  }

  pub fn convert(mut self, format: SupportedImageFormat) -> Self {
    self.convert = Some(ConvertOperation::new(format));
    self
  }

  pub fn execute(self, value: &Uint8Array) -> Uint8Array {
    let mut bytes = vec![0; value.length() as usize];
    value.copy_to(&mut bytes);

    let mut format = match image::guess_format(&bytes) {
      Ok(format) => format,
      Err(error) => wasm_bindgen::throw_str(error.to_string().as_str()),
    };

    let mut image = match image::load_from_memory_with_format(&bytes, format) {
      Ok(image) => image,
      Err(error) => wasm_bindgen::throw_str(error.to_string().as_str()),
    };

    // Resize
    image = match self.resize {
      Some(operation) => operation.execute(image),
      None => image,
    };

    // Crop
    image = match self.crop {
      Some(operation) => operation.execute(image),
      None => image,
    };

    // Format conversion
    format = match self.convert {
      Some(operation) => operation.format,
      None => format,
    };

    let mut buf: Cursor<Vec<u8>> = Cursor::new(Vec::new());

    match image.write_to(&mut buf, format) {
      Ok(()) => Uint8Array::from(buf.get_ref().as_slice()),
      Err(error) => wasm_bindgen::throw_str(error.to_string().as_str()),
    }
  }
}

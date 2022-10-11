use js_sys::Uint8Array;
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Picasso {
  info: WorkingImage,
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, Serialize, Deserialize)]
pub enum ImageFormat {
  Jpeg = "jpeg",
  Jpg = "jpg",
  Png = "png",
  WebP = "webp",
}

#[allow(clippy::from_over_into)]
impl Into<image::ImageFormat> for ImageFormat {
  fn into(self) -> image::ImageFormat {
    match self {
      ImageFormat::Jpeg | ImageFormat::Jpg => image::ImageFormat::Jpeg,
      ImageFormat::Png => image::ImageFormat::Png,
      ImageFormat::WebP => image::ImageFormat::WebP,
      ImageFormat::__Nonexhaustive => todo!(),
    }
  }
}

impl From<image::ImageFormat> for ImageFormat {
  fn from(format: image::ImageFormat) -> Self {
    match format {
      image::ImageFormat::Png => ImageFormat::Png,
      image::ImageFormat::Jpeg => ImageFormat::Jpeg,
      image::ImageFormat::WebP => ImageFormat::WebP,
      _ => unimplemented!(),
    }
  }
}

struct WorkingImage {
  image: image::DynamicImage,
  format: image::ImageFormat,
}

#[wasm_bindgen]
impl Picasso {
  #[wasm_bindgen(constructor)]
  pub fn new(value: &JsValue) -> Picasso {
    console_error_panic_hook::set_once();

    let byte_array = Uint8Array::new(value);

    let mut bytes = vec![0; byte_array.length() as usize];
    byte_array.copy_to(&mut bytes);

    let format = match image::guess_format(&bytes) {
      Ok(format) => format,
      Err(error) => wasm_bindgen::throw_str(error.to_string().as_str()),
    };

    let image = match image::load_from_memory_with_format(&bytes, format) {
      Ok(image) => image,
      Err(error) => wasm_bindgen::throw_str(error.to_string().as_str()),
    };

    Picasso {
      info: WorkingImage { image, format },
    }
  }

  #[wasm_bindgen]
  pub fn resize(self, width: u32, height: u32) -> Picasso {
    let image = self.info.image.resize(
      width,
      height,
      image::imageops::FilterType::Lanczos3,
    );

    Picasso {
      info: WorkingImage { image, ..self.info },
    }
  }

  #[wasm_bindgen]
  pub fn convert(self, format: ImageFormat) -> Picasso {
    Picasso {
      info: WorkingImage {
        format: format.into(),
        ..self.info
      },
    }
  }

  #[wasm_bindgen]
  pub fn write(self) -> Uint8Array {
    let mut buf: Cursor<Vec<u8>> = Cursor::new(Vec::new());

    match self.info.image.write_to(&mut buf, self.info.format) {
      Ok(()) => Uint8Array::from(buf.get_ref().as_slice()),
      Err(error) => wasm_bindgen::throw_str(error.to_string().as_str()),
    }
  }
}

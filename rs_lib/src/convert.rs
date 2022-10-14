use image::ImageFormat;
use serde::Serialize;
use wasm_bindgen::prelude::*;

pub struct ConvertOperation {
  pub format: ImageFormat,
}

#[wasm_bindgen]
#[derive(Serialize)]
pub enum SupportedImageFormat {
  Jpeg = "jpeg",
  Jpg = "jpg",
  Png = "png",
  WebP = "webp",
}

#[allow(clippy::from_over_into)]
impl Into<ImageFormat> for SupportedImageFormat {
  fn into(self) -> ImageFormat {
    match self {
      SupportedImageFormat::Jpeg | SupportedImageFormat::Jpg => {
        ImageFormat::Jpeg
      }
      SupportedImageFormat::Png => ImageFormat::Png,
      SupportedImageFormat::WebP => ImageFormat::WebP,
      SupportedImageFormat::__Nonexhaustive => todo!(),
    }
  }
}

impl From<ImageFormat> for SupportedImageFormat {
  fn from(format: ImageFormat) -> Self {
    match format {
      ImageFormat::Png => SupportedImageFormat::Png,
      ImageFormat::Jpeg => SupportedImageFormat::Jpeg,
      ImageFormat::WebP => SupportedImageFormat::WebP,
      _ => unimplemented!(),
    }
  }
}

impl ConvertOperation {
  pub fn new(format: SupportedImageFormat) -> Self {
    Self {
      format: format.into(),
    }
  }
}

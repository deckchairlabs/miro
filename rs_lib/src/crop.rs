use image::DynamicImage;

pub struct CropOperation {
  x: u32,
  y: u32,
  width: u32,
  height: u32,
}

impl CropOperation {
  pub fn new(x: u32, y: u32, width: u32, height: u32) -> Self {
    Self {
      x,
      y,
      width,
      height,
    }
  }

  pub fn execute(self, image: DynamicImage) -> DynamicImage {
    image.crop_imm(self.x, self.y, self.width, self.height)
  }
}

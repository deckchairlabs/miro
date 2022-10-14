use image::imageops::FilterType;
use image::DynamicImage;

pub struct ResizeOperation {
  width: u32,
  height: u32,
  filter: FilterType,
}

impl ResizeOperation {
  pub fn new(width: u32, height: u32, filter: Option<FilterType>) -> Self {
    Self {
      width,
      height,
      filter: filter.unwrap_or(FilterType::Lanczos3),
    }
  }

  pub fn execute(self, image: DynamicImage) -> DynamicImage {
    image.resize(self.width, self.height, self.filter)
  }
}

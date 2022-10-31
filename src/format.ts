type SupportedFormat = {
  format: string;
  contentType: string;
};

export function resolveBestSupportedFormat(
  request: Request,
  response: Response,
): SupportedFormat {
  const accepts = request.headers.get("accept");
  const contentType = response.headers.get("content-type")!;

  const formatMap: Record<string, SupportedFormat> = {
    "image/avif": { format: "jpg", contentType: "image/jpeg" },
    "image/webp": { format: "jpg", contentType: "image/jpeg" },
    "image/jpeg": { format: "jpg", contentType: "image/jpeg" },
    "image/jpg": { format: "jpg", contentType: "image/jpeg" },
    "image/png": { format: "png", contentType: "image/png" },
  };

  const acceptedFormat = Object.keys(formatMap).find(([format]) =>
    accepts?.includes(format)
  );

  if (acceptedFormat !== contentType) {
    return formatMap[contentType];
  } else if (acceptedFormat) {
    return formatMap[acceptedFormat];
  }

  return {
    format: "jpg",
    contentType: "image/jpeg",
  };
}

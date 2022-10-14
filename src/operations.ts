export type ParsedOperation = [name: string, args: Record<string, string>];

const resize = new URLPattern({
  pathname: ":op(rs|resize){\\::width}{\\::height}?",
});

const crop = new URLPattern({
  pathname: ":op(c|crop){\\::x}{\\::y}{\\::width}{\\::height}?",
});

const operations = [resize, crop];

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export function parse(processingOptions: string) {
  const options = processingOptions.split(",");
  return options.flatMap((option) =>
    operations.filter((operation) => operation.test({ pathname: option })).map(
      (operation): ParsedOperation | undefined => {
        const groups = operation.exec({ pathname: option })?.pathname.groups;
        if (groups) {
          const { op, ...args } = groups;
          return [op, args];
        }
      },
    )
  ).filter(notEmpty);
}

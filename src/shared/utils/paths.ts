type ConfigPathType = Record<
  string,
  {
    path: string;
  }
>;

export function tsSubPath<TConfig extends ConfigPathType>(subPath: TConfig[keyof TConfig]["path"]) {
  return subPath;
}

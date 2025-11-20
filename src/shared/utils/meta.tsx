interface MetaProps {
  title?: string;
  description?: string;
  charset?: string;
  viewport?: string;
}

export function Meta({
  title = "TimeTrack",
  description,
  charset = "UTF-8",
  viewport = "width=device-width, initial-scale=1.0",
}: MetaProps = {}): JSX.Element {
  return (
    <>
      <meta charset={charset} />
      <meta name="viewport" content={viewport} />
      <title safe>{title}</title>
      {description ? <meta name="description" content={description} safe /> : null}
    </>
  );
}

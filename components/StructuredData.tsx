interface StructuredDataProps {
  readonly data: Record<string, unknown>;
}

export default function StructuredData({ data }: StructuredDataProps): JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

import React from 'react';

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export const JsonLd = ({ data }: JsonLdProps) => {
  const jsonData = Array.isArray(data) ? data : [data];

  return jsonData.map((item, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
    />
  ));
};

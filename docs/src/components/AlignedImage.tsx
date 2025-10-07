import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

export const AlignedImage = ({
  imageURL,
  alt,
  alignment,
  imageURLDark,
}: {
  imageURL: string;
  imageURLDark?: string;
  alt: string;
  alignment: 'center' | 'left' | 'right';
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: alignment ?? 'center',
        marginBottom: '20px',
      }}>
      <ThemedImage
        alt={alt}
        sources={{
          light: useBaseUrl(imageURL),
          dark: useBaseUrl(imageURLDark ?? imageURL),
        }}
      />
    </div>
  );
};

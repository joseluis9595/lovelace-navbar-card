import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export const AlignedImage = ({
  imageURL,
  alt,
  alignment,
}: {
  imageURL: string;
  alt: string;
  alignment: 'center' | 'left' | 'right';
}) => {
  const image = useBaseUrl(imageURL);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: alignment ?? 'center',
        marginBottom: '20px',
      }}>
      <img src={image} alt={alt} />
    </div>
  );
};

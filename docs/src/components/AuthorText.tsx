import React from 'react';
import styles from './AuthorText.module.css';

interface AuthorTextProps {
  author?: string;
  authorUrl?: string;
}

export function AuthorText({ author, authorUrl }: AuthorTextProps) {
  if (!author) return null;

  return (
    <span className={styles.author}>
      {authorUrl ? (
        <a href={authorUrl} target="_blank" rel="noopener noreferrer">
          Created by {author}
        </a>
      ) : (
        `Created by ${author}`
      )}
    </span>
  );
}

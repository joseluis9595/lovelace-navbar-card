import React, { useEffect } from 'react';
import styles from './ExampleDialog.module.css';
import { AuthorText } from './AuthorText';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Example } from '../data/examples';

interface ExampleDialogProps {
  example: Example;
  onClose: () => void;
}

export function ExampleDialog({ example, onClose }: ExampleDialogProps) {
  const baseUrl = useBaseUrl('/');

  // prevent scroll from bubbling up to the parent component
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      onWheel={e => e.stopPropagation()}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{example.title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <img
              className={styles.image}
              src={`${baseUrl}${example.screenshot}`}
              alt={example.title}
            />
          </div>
          <div className={styles.info}>
            <p className={styles.description}>{example.description}</p>
            <AuthorText author={example.author} authorUrl={example.authorUrl} />
          </div>
          <div className={styles.codeContainer}>
            <button
              className={styles.copyButton}
              onClick={e => {
                e.stopPropagation();
                navigator.clipboard.writeText(example.code);
                const button = e.currentTarget;
                button.innerText = 'Copied!';
                setTimeout(() => {
                  button.innerText = 'Copy';
                }, 2000);
              }}>
              Copy
            </button>
            <pre>
              <code>{example.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

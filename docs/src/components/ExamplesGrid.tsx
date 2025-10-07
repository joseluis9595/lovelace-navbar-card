import React, { useState } from 'react';
import styles from './ExamplesGrid.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface Example {
  title: string;
  description: string;
  code: string;
  screenshot: string;
  createdBy: string;
}

interface ExamplesGridProps {
  examples: Example[];
}

export function ExamplesGrid({ examples }: ExamplesGridProps) {
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const baseUrl = useBaseUrl('/');

  return (
    <div>
      <div className={styles.grid}>
        {examples.map((example, index) => (
          <div
            key={index}
            className={styles.exampleCard}
            onClick={() => setSelectedExample(example)}>
            <img
              className={styles.exampleImage}
              src={`${baseUrl}${example.screenshot}`}
              alt={example.title}
            />
            <div className={styles.exampleContent}>
              <h3 className={styles.exampleTitle}>{example.title}</h3>
              <p className={styles.exampleDescription}>{example.description}</p>
              {example.createdBy && (
                <p className={styles.exampleCreator}>
                  Created by {example.createdBy}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedExample && (
        <div
          className={styles.dialogOverlay}
          onClick={() => setSelectedExample(null)}>
          <div className={styles.dialog} onClick={e => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>{selectedExample.title}</h2>
              <button
                className={styles.dialogClose}
                onClick={() => setSelectedExample(null)}>
                ×
              </button>
            </div>
            <div className={styles.dialogContent}>
              <div className={styles.dialogImageContainer}>
                <img
                  className={styles.dialogImage}
                  src={`${baseUrl}${selectedExample.screenshot}`}
                  alt={selectedExample.title}
                />
              </div>
              <div className={styles.dialogInfo}>
                <p className={styles.dialogDescription}>
                  {selectedExample.description}
                </p>
                {selectedExample.createdBy && (
                  <p className={styles.dialogCreator}>
                    Created by {selectedExample.createdBy}
                  </p>
                )}
              </div>
              <pre>
                <code>{selectedExample.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

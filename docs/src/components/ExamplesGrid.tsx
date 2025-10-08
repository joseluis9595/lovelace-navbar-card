import React, { useState } from 'react';
import styles from './ExamplesGrid.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  configurationExamples,
  Example,
  stylingExamples,
} from '../data/examples';
import { AuthorText } from './AuthorText';
import { ExampleDialog } from './ExampleDialog';

type Category = 'configuration' | 'styling';

export function ExamplesGrid() {
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('styling');
  const baseUrl = useBaseUrl('/');

  const currentExamples =
    selectedCategory === 'configuration'
      ? configurationExamples
      : stylingExamples;

  return (
    <div>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            selectedCategory === 'styling' ? styles.tabActive : ''
          }`}
          onClick={() => setSelectedCategory('styling')}>
          Styling Examples
        </button>
        <button
          className={`${styles.tab} ${
            selectedCategory === 'configuration' ? styles.tabActive : ''
          }`}
          onClick={() => setSelectedCategory('configuration')}>
          Configuration Examples
        </button>
      </div>
      <div className={styles.grid}>
        {currentExamples.map((example, index) => (
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
              <AuthorText
                author={example.author}
                authorUrl={example.authorUrl}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedExample && (
        <ExampleDialog
          example={selectedExample}
          onClose={() => setSelectedExample(null)}
        />
      )}
    </div>
  );
}

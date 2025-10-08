import React, { useEffect, useRef, useState } from 'react';
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
  const openedWithClick = useRef(false);

  // Handle browser history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (!hash) {
        setSelectedExample(null);
        return;
      }

      // Find example by title in URL
      const allExamples = [...configurationExamples, ...stylingExamples];
      const example = allExamples.find(
        ex => ex.title.toLowerCase().replace(/\s+/g, '-') === hash,
      );

      if (example) {
        setSelectedExample(example);
        setSelectedCategory(
          configurationExamples.includes(example) ? 'configuration' : 'styling',
        );
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
            onClick={() => {
              openedWithClick.current = true;
              const hash = example.title.toLowerCase().replace(/\s+/g, '-');
              window.location.hash = hash;
            }}>
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
          onClose={() => {
            if (openedWithClick.current) {
              window.history.back();
            } else {
              window.history.replaceState(null, '', window.location.pathname);
            }
            openedWithClick.current = false;
            setSelectedExample(null);
          }}
        />
      )}
    </div>
  );
}

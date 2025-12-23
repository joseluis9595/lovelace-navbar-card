import React, { useEffect, useRef, useState } from 'react';
import styles from './ExamplesGrid.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { EXAMPLE_TAG, type Example, examples } from '../data/examples';
import { AuthorText } from './AuthorText';
import { ExampleDialog } from './ExampleDialog';


export function ExamplesGrid() {
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EXAMPLE_TAG | null>(null);
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
      const example = examples.find(
        ex => ex.title.toLowerCase().replace(/\s+/g, '-') === hash,
      );

      if (example) {
        setSelectedExample(example);
        setSelectedCategory((example.tags[0] as EXAMPLE_TAG) ?? null);
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const currentExamples =
    selectedCategory === null
      ? examples
      : examples.filter(example =>
          example.tags.includes(selectedCategory as EXAMPLE_TAG),
        );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${
              selectedCategory === null ? styles.tabActive : ''
            }`}
            onClick={() => setSelectedCategory(null)}>
            All examples
          </button>
          {Object.values(EXAMPLE_TAG).map(tag => (
            <button
              key={tag}
              type="button"
              className={`${styles.tab} ${
                selectedCategory === tag ? styles.tabActive : ''
              }`}
              onClick={() => setSelectedCategory(tag)}>
              {tag}
            </button>
          ))}
        </div>
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

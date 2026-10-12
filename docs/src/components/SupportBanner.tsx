import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './SupportBanner.module.css';

export function SupportBanner() {
  return (
    <aside className={styles.banner}>
      <span className={styles.icon} aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M19.5 12.5 12 20l-7.5-7.5a5 5 0 0 1 7.5-6.55 5 5 0 0 1 7.5 6.55z" />
        </svg>
      </span>
      <div className={styles.copy}>
        <p className={styles.title}>Like the card?</p>
        <p>
          If <code>navbar-card</code> saves you time on your dashboards, consider
          buying me a beer. It helps fund ongoing maintenance.
        </p>
      </div>
      <div className={styles.actions}>
        <a
          className={clsx('button', 'button--sm', styles.cta)}
          href="https://www.buymeacoffee.com/joseluis9595"
          target="_blank"
          rel="noopener noreferrer">
          Buy me a beer
        </a>
        <Link className={styles.link} to="/docs/support">
          Other ways to help
        </Link>
      </div>
    </aside>
  );
}

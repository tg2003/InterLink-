import React from 'react';
import InlineLoader from './InlineLoader';

/**
 * Reusable inline loading state component for views, tables, and card bodies.
 * Displays centered loading text with the brand animated loader immediately after it.
 *
 * Example output: "Loading vacancies... <loading animation>"
 */
export default function LoadingState({
  text = 'Loading...',
  size = 18,
  variant = 'dark',
  style = {},
  className = '',
  padding = '3rem',
}) {
  return (
    <div
      className={`loading-state-inline ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding,
        color: 'var(--text-muted, #64748b)',
        fontSize: '0.92rem',
        ...style,
      }}
    >
      <span>{text}</span>
      <InlineLoader size={size} variant={variant} />
    </div>
  );
}

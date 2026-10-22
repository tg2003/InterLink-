import React from 'react';

/**
 * Inline loading spinner component matching project brand styling.
 * Used beside text inside buttons or action labels when action exceeds 1000ms.
 *
 * @param {number} [size] - Optional width and height in px
 * @param {'light'|'dark'} [variant='light'] - 'light' for primary blue buttons, 'dark' for white/light buttons
 * @param {string} [className] - Optional extra class names
 */
export default function InlineLoader({ size, variant = 'light', className = '' }) {
  const inlineStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;
  const variantClass = variant === 'dark' ? 'loader-inline-dark' : 'loader-inline-light';

  return (
    <span
      className={`loader loader-inline ${variantClass} ${className}`.trim()}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
}

import React from 'react';

/**
 * Converts markdown-style bold syntax to HTML bold tags
 * Example: "**bold text**" becomes "<strong>bold text</strong>"
 */
export function formatBoldText(text: string): string {
  if (!text) return '';
  
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Renders text with markdown-style bold syntax as React nodes with bold styling
 */
export function renderBoldText(text: string): React.ReactNode {
  if (!text) return null;
  
  const parts: (string | React.ReactElement)[] = [];
  const regex = /(\*\*.*?\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the matched bold text (without the ** markers)
    if (match[0]) {
      const boldText = match[0].substring(2, match[0].length - 2);
      parts.push(React.createElement('strong', { key: match.index }, boldText));
      lastIndex = match.index + match[0].length;
    }
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

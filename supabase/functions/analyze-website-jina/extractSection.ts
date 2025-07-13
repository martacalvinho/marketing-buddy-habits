// Extract a section from markdown by heading
export function extractSection(markdown: string, heading: string): string {
  const regex = new RegExp(`##?\\s*${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(.*?)(?=\\n##? |$)`, 'is');
  const match = markdown.match(regex);
  if (match) {
    return match[1].trim();
  }
  return '';
}

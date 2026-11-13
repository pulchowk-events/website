import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeScrapedText } from "@/app/lib/smartText";

interface MarkdownProps {
  content: string;
  className?: string;
}

export default function Markdown({ content, className = '' }: MarkdownProps) {
  if (!content) return null;
  return (
    <div className={'markdown ' + className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeScrapedText(content)}</ReactMarkdown>
    </div>
  );
}

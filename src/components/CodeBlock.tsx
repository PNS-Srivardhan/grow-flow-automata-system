
import React from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const trimmedCode = code.trim();
  
  return (
    <div className="relative">
      <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
        <code className={`language-${language}`}>
          {trimmedCode}
        </code>
      </pre>
    </div>
  );
};

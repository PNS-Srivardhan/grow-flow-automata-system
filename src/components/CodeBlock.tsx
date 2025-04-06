
import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-cpp';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const trimmedCode = code.trim();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll();
    }
  }, [trimmedCode]);
  
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

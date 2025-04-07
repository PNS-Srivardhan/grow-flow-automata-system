
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
  showCopyButton?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language, 
  code,
  showCopyButton = true 
}) => {
  const trimmedCode = code.trim();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll();
    }
  }, [trimmedCode]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(trimmedCode);
  };
  
  return (
    <div className="relative">
      {showCopyButton && (
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-hydroponics-teal/20 hover:bg-hydroponics-teal/30 text-hydroponics-teal text-xs py-1 px-2 rounded"
        >
          Copy
        </button>
      )}
      <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
        <code className={`language-${language}`}>
          {trimmedCode}
        </code>
      </pre>
    </div>
  );
};

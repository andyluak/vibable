import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

import "./code-theme.css";
import { useEffect } from "react";

export const CodeView = ({
  code,
  language,
}: {
  code: string;
  language: string;
}) => {
  useEffect(() => {
    Prism.highlightAll();
  });

  return (
    <pre
      className={`p-2 bg-transparent border-none rounded-none m-0 text-xs! whitespace-pre-wrap overflow-wrap-anywhere`}
    >
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};

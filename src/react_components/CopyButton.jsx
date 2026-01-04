import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

   return (
      <button
         className={copied ? "copied" : ""}
         onClick={handleCopy}
      >
         {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
  );
}

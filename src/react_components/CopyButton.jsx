export default function CopyButton({ text }) {
   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(text);
         alert("Copied to clipboard");
      } catch (err) {
         console.error("Failed to copy: ", err);
      }
   }

   return (
      <button onClick={handleCopy}>
         Copy to Clipboard
      </button>
   )
}
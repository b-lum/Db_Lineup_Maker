/**
 * React component that renders a button to copy a given text to the clipboard.
 *
 * @param {Object} props - Component props.
 * @param {string} props.text - The text string to copy to the clipboard when the button is clicked.
 *
 * @returns {JSX.Element} The rendered button element.
 */
export default function CopyButton({ text }) {

   /**
    * Handles the copy action when the button is clicked.
    * Uses the Clipboard API to write the provided text to the clipboard.
    * Shows an alert on success and logs an error on failure.
    */
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
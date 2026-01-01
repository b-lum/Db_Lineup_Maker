/**
 * React component that renders a single cell in a lineup grid.
 * Displays the person's name and weight if a person exists, or "empty" otherwise.
 * Supports drag-and-drop functionality via the provided dragProps.
 *
 * @param {Object} props - Component props.
 * @param {Object|null} props.person - The Person object to display. If null, cell is empty.
 * @param {string} props.person.name - Name of the person.
 * @param {number} props.person.weight - Weight of the person in pounds.
 * @param {Object} props.dragProps - Props for enabling drag-and-drop functionality.
 *
 * @returns {JSX.Element} The rendered lineup cell component.
 */
export default function PersonCell({ 
  person,
  dragProps,
  onClick,
  selected = false,
}) {
    return (
      <div 
      className={`lineup-cell ${selected ? "selected" : ""}`}
      draggable={!!person}
      onClick={onClick}
      {...dragProps}
      >
        {person ? (
          <>
            <span className="person-name">{person.name}</span><br />
            {person.weight} lbs
          </>
        ) : (
          "empty"
        )}
      </div>
    );
  }
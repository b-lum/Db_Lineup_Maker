import PCStyle from "./PersonCell.module.css"
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
   variant = "default",
   position,
   dragProps,
   onClick,
   selected = false,
}) {
     return (
       <div 
         className={`${PCStyle.cell} ${selected ? PCStyle.selected : ""}`}
         draggable={!!person}
         onClick={onClick}
       {...dragProps}
       >
        {position && (
          <div className={PCStyle.positionBadge}>
            {position}
          </div>
        )}

        {!person && (
          <span className={PCStyle.name}></span>
        )}

        {person && variant === "roster" && (
          <>
            <span className={PCStyle.name}>{person.name}</span>
          </>
        )}

        {person && variant === "lineup" && (
          <span className={PCStyle.name}>
            {person.name}
          </span>
        )}

       </div>
     );
}
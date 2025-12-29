import PersonCell from "./PersonCell.jsx";


/**
 * React component that renders a grid of people for a lineup.
 * Displays each row with optional labels (Caller, Steer, L/R row numbers)
 * and renders each person using the PersonCell component.
 *
 * @param {Object} props - Component props.
 * @param {string} props.title - Title to display above the grid.
 * @param {Array<Array<Object|null>>} props.grid - 2D array representing the lineup grid, 
 *                                                where each element is a Person object or null.
 * @param {Object} props.gridMeta - Metadata describing the grid type and context.
 * @param {string} props.gridMeta.type - Type of grid; can be "heat" or "sorted".
 * @param {function} props.dragHandler - Function that returns drag-and-drop props for a PersonCell.
 *                                       Signature: (gridMeta, rowIndex, colIndex) => dragProps.
 *
 * @returns {JSX.Element} The rendered lineup grid component.
 */
export default function LineupGrid({
  title,
  grid,
  gridMeta,
  dragHandler,
}) {
  return (
    <div className="lineup-grid">
      <p>{title}</p>

      {grid.map((row, i) => (
        <div className="lineup-row" key={i}>

          {gridMeta.type === "heat" && (
            i === 0 ? (
               <div className = "lineup-label">Caller</div>
            ) : (
              <div className = "lineup-label">L {i}</div>
            )
          )}

          {row.map((p, j) => (
            <PersonCell
              key={j}
              person={p}
              dragProps={dragHandler(gridMeta, i, j)}
            />
          ))}

          {gridMeta.type === "heat" && (
            i === 0 ? (
              <div className = "lineup-label">Steer</div>
            ) : ( 
              <div className = "lineup-label">R {i}</div>
            )
          )}

        </div>
      ))}
    </div>
  );
}
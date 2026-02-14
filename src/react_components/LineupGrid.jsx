import PersonCell from "./PersonCell.jsx";
import LGStyles from './LineupGrid.module.css';


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
   onCellClick,
   selected,
}) {
   return (
      <div className={LGStyles.grid}>
         <p>{title}</p> 

         {grid.map((row, i) => {
            // === compute visual cells before returning JSX ===
            let visualCells;
            if (i === 0) {
               visualCells = [row[0]]; // first row → 1 cell (Caller)
            } else if (i === grid.length - 1) {
               visualCells = [row[0]]; // last row → 1 cell (Steer)
            } else {
               visualCells = row.slice(0, 2); // middle rows → 2 cells
            }

            return (
               <div className={LGStyles.row} key={i}>
                  {/* Labels */}
                  {gridMeta.type === "heat" && (
                     i === 0 ? (
                        <div className={LGStyles.label}>Caller</div>
                     ) : i === grid.length - 1 ? (
                        <div className={LGStyles.label}>Steer</div>
                     ) : (
                        <div className={LGStyles.label}>L {i}</div>
                     )
                  )}

                  {/* Cells */}
                  {visualCells.map((p, j) => {
                     const isSelected =
                        selected &&
                        p &&
                        selected.type === gridMeta.type &&
                        selected.row === i &&
                        selected.col === j &&
                        (gridMeta.type !== "heat" ||
                           selected.heatIdx === gridMeta.heatIdx);

                     return (
                        <PersonCell
                           key={j}
                           person={p}
                           dragProps={dragHandler(gridMeta, i, j)}
                           onClick={() => onCellClick(gridMeta, i, j, p)}
                           selected={isSelected}
                        />
                     );
                  })}

                  {/* Right-side labels for heat */}
                  {gridMeta.type === "heat" && i !== 0 && i !== grid.length - 1 && (
                     <div className={LGStyles.label}>R {i}</div>
                  )}
               </div>
            );
         })}
      </div>
   );
}

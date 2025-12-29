import "../App.css";
import LineupGrid from "./LineupGrid.jsx";


/**
 * React component that renders heats for a boat, including lineups for each heat
 * and a roster of unscheduled participants. Supports drag-and-drop to move or swap
 * participants between heats and roster.
 *
 * @param {Object} props - Component props.
 * @param {import("../lineup_objects/BoatHeats").BoatHeats} props.heats - The BoatHeats object containing all lineups for this boat.
 * @param {import("../lineup_objects/SortedArray").SortedArray} props.roster - A sorted array of all available people for assignment.
 * @param {function} props.onUpdate - Callback function called when the heats object is updated.
 *
 * @returns {JSX.Element} The rendered BoatHeats component.
 */
export default function BoatHeats({
  heats,
  roster,
  onUpdate,
}) {

  /**
   * Move or swap a person between heats or between heat and roster.
   * Clones the heats object, applies the move, and triggers onUpdate.
   * @param {Object} param0 - Object containing from and to positions.
   * @param {Object} param0.from - Source position.
   * @param {Object} param0.to - Destination position.
   */
  const movePerson = ({ from, to }) => {
    const next = heats.clone();
    next.movePerson({ from, to }, roster);
    onUpdate(next);
  }

  /**
   * Generate drag-and-drop event handlers for a person cell.
   * @param {Object} meta - Metadata for the grid type and heat index.
   * @param {number} row - Row index of the cell.
   * @param {number} col - Column index of the cell.
   * @returns {Object} Object containing drag event handlers (onDragStart, onDragEnter, onDragOver, onDrop).
   */
  const dragHandler = (meta, row, col) => ({
    onDragStart: e => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ ...meta, row, col })
      )
    },

    onDragEnter: e => e.preventDefault(),
    onDragOver: e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },

    onDrop: e => {
      e.preventDefault();

      const from = JSON.parse(
        e.dataTransfer.getData("application/json")
      )

      movePerson({
        from,
        to: { ...meta, row, col }
      })
    }
  })

  /**
   * Convert a sorted array (roster) into a 2D grid with 2 columns for display.
   * @param {import("../lineup_objects/SortedArray").SortedArray} sorted - SortedArray of Person objects.
   * @returns {Array<Array<Object|null>>} 2D array representing rows and columns of people.
   */
  const getPeopleGrid = sorted => {
    const people = sorted.getAll();
    const cols = 2;
    const rows = Math.ceil(people.length / cols);
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => people[r * cols + c] ?? null)
    );
  };

  return (
    <div className="boat-heats">

      <div className="lineup-container">
        {Array.from(heats.lineups.entries()).map(([idx, lineup]) => (
          <div className="item" key={idx}>
            <LineupGrid
              title={`Heat ${idx + 1}`}
              grid={lineup.grid}
              gridMeta={{ type: "heat", heatIdx: idx }}
              dragHandler={dragHandler}
            />
            <div className="lineup-row weight-row">
              <div className="lineup-label" />
                Left Weight:
              <div>
                {lineup.leftWeight}
              </div>

              <div className="lineup-label" />
                Right Weight:
              <div>
                {lineup.rightWeight}
              </div>

            </div>
          </div>
        ))}

        <div className="scroll-container">

          <div className="item people-item">
            <LineupGrid
              title="Roster"
              grid={getPeopleGrid(roster)}
              gridMeta={{ type: "sorted" }}
              dragHandler={dragHandler}
            />
          </div>
        </div>
      </div>

    </div>
  )
}
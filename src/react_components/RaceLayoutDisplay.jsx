import RLDStyle from "./RaceLayoutDisplay.module.css"
import { useState, useEffect } from "react";
import LineupGrid from "./LineupGrid.jsx";
import Roster from "./Roster.jsx";


/**
 * React component that renders lineupgrids for a boat, including lineups for each heat
 * and a roster of unscheduled participants. Supports drag-and-drop to move or swap
 * participants between lineupgrids and roster.
 *
 * @param {Object} props - Component props.
 * @param {import("../lineup_objects/RaceLayout").RaceLayout} props.lineupgrids - The RaceLayout object containing all lineups for this boat.
 * @param {import("../lineup_objects/SortedArray").SortedArray} props.roster - A sorted array of all available people for assignment.
 * @param {function} props.onUpdate - Callback function called when the lineupgrids object is updated.
 *
 * @returns {JSX.Element} The rendered RaceLayout component.
 */
export default function RaceLayoutDisplay({
  lineupgrids,
  roster,
  onUpdate,
  filteredPeople,
  setFilteredPeople,
  searchTerm,
  setSearchTerm,
}) {

  const [selected, setSelected] = useState(null);
  // selected = { type, heatIdx?, row, col, person }

  /**
   * Move or swap a person between lineupgrids or between lineupgrid and roster.
   * Clones the lineupgrids object, applies the move, and triggers onUpdate.
   * @param {Object} param0 - Object containing from and to positions.
   * @param {Object} param0.from - Source position.
   * @param {Object} param0.to - Destination position.
   */
  const movePerson = ({ from, to }) => {
    const next = lineupgrids.clone();
    next.movePerson({ from, to }, roster);
    onUpdate(next);
    console.log("movePerson", from, to);

  }

  const replacePerson = (meta, row, col, newPerson) => {
    const next = lineupgrids.clone();

    console.log("Replacing at:", meta, row, col, newPerson);    
    if (meta.type !== "heat") return;
    next.replacePerson(meta.heatIdx, row, col, newPerson);

    onUpdate(next);
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (!selected) return;

      if (e.key === "Escape") {
        setSelected(null);
      }
      else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();

        const next = lineupgrids.clone();

        console.log("Deleted Person");

        next.movePerson(
          {
            from: {
              type: selected.type,
              heatIdx: selected.heatIdx,
              row: selected.row,
              col: selected.col,
            },
            to: {
              type: "sorted"
            }
          },
          roster
        );

        onUpdate(next);
        setSelected(null);
      }
      // Arrow keys
      
      
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

  }, [selected, lineupgrids, roster, onUpdate]);
    
    
  const selectedNames = new Set();

  for (const lineup of lineupgrids.lineups.values()) {
    for (const person of lineup.peopleMap.values()) {
      selectedNames.add(person.name);
    }
  }

  const handleAutoFill = (heatIdx) => {
    const next = lineupgrids.clone();
    const lineup = next.lineups.get(heatIdx);
    const balanced = lineup.fill(roster);

    next.lineups.set(heatIdx, balanced);

    onUpdate(next);
  };

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


  const handleCellClick = (meta, row, col, personInCell) => {
    // Click empty cell → ignore
    if (!personInCell && !selected) return;

    // === SELECT ===
    if (!selected && personInCell) {
      setSelected({
        type: meta.type,
        heatIdx: meta.type === "heat" ? meta.heatIdx : null,
        row,
        col,
        person: personInCell
      });
      return;
    }

    // === MOVE ===
    if (selected) {
      const next = lineupgrids.clone();

      next.movePerson(
        {
          from: {
            type: selected.type,
            heatIdx: selected.heatIdx,
            row: selected.row,
            col: selected.col
          },
          to: {
            type: meta.type,
            heatIdx: meta.type === "heat" ? meta.heatIdx : null,
            row,
            col
          }
        },
        roster
      );

      onUpdate(next);
      setSelected(null);
    }
  };


  return (
    <div className={RLDStyle.lineupGridContainer}>
      
      <div className="scrollContainerWrapper">
        <div className={RLDStyle.scrollContainer}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: "8px", padding: "6px", width: "90%" }}
          />

          <div className="item people-item">
            <Roster
              title="Roster"
              people={filteredPeople}  // pass 1D array
              dragHandler={dragHandler}
              onCellClick={handleCellClick}
              selected={selected}
            />
          </div>
        </div>
      </div>

      <div className={RLDStyle.lineupContainer}>
        {Array.from(lineupgrids.lineups.entries()).map(([idx, lineup]) => (
          <div className="item" key={idx}>
            <LineupGrid
              title={`Heat ${idx + 1}`}
              grid={lineup.grid}
              gridMeta={{ type: "heat", heatIdx: idx }}
              dragHandler={dragHandler}
              onCellClick={handleCellClick}
              selected={selected}
              allPeople={roster.getAll()}
              selectedNames={selectedNames}
              onReplace={replacePerson}
            />
            <div className={RLDStyle.weightRow}>
              <div>{`${lineup.leftWeight}`}</div>
              <div>{`${lineup.rightWeight - lineup.leftWeight}`}</div>
              <div>{`${lineup.rightWeight}`}</div>
            </div>
            <button onClick={() => handleAutoFill(idx)}>
              Fill
            </button>
          </div>
        ))}
      </div>


    </div>
  )
}
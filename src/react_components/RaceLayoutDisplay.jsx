import RLDStyle from "./RaceLayoutDisplay.module.css"
import { useState, useEffect } from "react";
import LineupGrid from "./LineupGrid.jsx";
import Roster from "./Roster.jsx";
import { PracticeLayout } from "../data_objects/boat_layouts/PracticeLayout.js";

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

  const movePerson = ({ from, to }) => {
    const next = lineupgrids.clone();
    next.movePerson({ from, to }, roster);
    onUpdate(next);
  };

  const replacePerson = (meta, row, col, newPerson) => {
    const next = lineupgrids.clone();
    if (meta.type !== "heat") return;
    next.replacePerson(meta.heatIdx, row, col, newPerson);
    onUpdate(next);
  };

  // Add a new lineup at the end
  const handleAddBoat = () => {
    const next = lineupgrids.clone();
    next.addBoat();
    onUpdate(next);
  };

  // Remove a lineup by index
  const handleRemoveBoat = (idx) => {
    const next = lineupgrids.clone();
    next.removeBoat(idx);
    onUpdate(next);
    setSelected(null);
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (!selected) return;
      if (e.key === "Escape") {
        setSelected(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        const next = lineupgrids.clone();
        next.movePerson(
          {
            from: { type: selected.type, heatIdx: selected.heatIdx, row: selected.row, col: selected.col },
            to: { type: "sorted" }
          },
          roster
        );
        onUpdate(next);
        setSelected(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, lineupgrids, roster, onUpdate]);

  const selectedNames = new Set();
  for (const lineup of lineupgrids.lineups.values())
    for (const person of lineup.peopleMap.values())
      selectedNames.add(person.name);

  const isPractice = lineupgrids instanceof PracticeLayout;

  const handleAutoFill = (heatIdx) => {
    const next = lineupgrids.clone();
    const lineup = next.lineups.get(heatIdx);

    // For PracticeLayout: exclude people already in OTHER lineups
    let rosterForFill = roster;
    if (isPractice) {
      const otherAssigned = new Set();
      for (const [idx, l] of next.lineups.entries()) {
        if (idx === heatIdx) continue;
        for (const name of l.peopleMap.keys()) otherAssigned.add(name);
      }
      // Build a filtered Roster-like object with the same interface
      const filteredPeople = roster.getAll().filter(p => !otherAssigned.has(p.name));
      rosterForFill = { getAll: () => filteredPeople };
    }

    const balanced = lineup.fill(rosterForFill);
    next.lineups.set(heatIdx, balanced);
    onUpdate(next);
  };

  const dragHandler = (meta, row, col) => ({
    onDragStart: e => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/json", JSON.stringify({ ...meta, row, col }));
    },
    onDragEnter: e => e.preventDefault(),
    onDragOver: e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; },
    onDrop: e => {
      e.preventDefault();
      const from = JSON.parse(e.dataTransfer.getData("application/json"));
      movePerson({ from, to: { ...meta, row, col } });
    }
  });

  const handleCellClick = (meta, row, col, personInCell) => {
    if (!personInCell && !selected) return;

    if (!selected && personInCell) {
      setSelected({ type: meta.type, heatIdx: meta.type === "heat" ? meta.heatIdx : null, row, col, person: personInCell });
      return;
    }

    if (selected) {
      const next = lineupgrids.clone();
      next.movePerson(
        {
          from: { type: selected.type, heatIdx: selected.heatIdx, row: selected.row, col: selected.col },
          to: { type: meta.type, heatIdx: meta.type === "heat" ? meta.heatIdx : null, row, col }
        },
        roster
      );
      onUpdate(next);
      setSelected(null);
    }
  };

  return (
    <div className={RLDStyle.lineupGridContainer}>

      {/* Roster panel */}
      <div className="scrollContainerWrapper">
        <div className={RLDStyle.scrollContainer}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Roster
            title="Roster"
            people={filteredPeople}
            dragHandler={dragHandler}
            onCellClick={handleCellClick}
            selected={selected}
          />
        </div>
      </div>

      {/* Lineups + add button */}
      <div className={RLDStyle.lineupContainer}>
        {Array.from(lineupgrids.lineups.entries()).map(([idx, lineup]) => (
          <div className={RLDStyle.lineupItem} key={idx}>
            {/* Header with title and remove button */}
            <div className={RLDStyle.lineupHeader}>
              <span className={RLDStyle.lineupTitle}>Boat {idx + 1}</span>
              <button
                className={RLDStyle.removeBtn}
                onClick={() => handleRemoveBoat(idx)}
                title="Remove this lineup"
              >
                ×
              </button>
            </div>

            <LineupGrid
              title=""
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
              <div>{lineup.leftWeight}</div>
              <div>{lineup.rightWeight - lineup.leftWeight}</div>
              <div>{lineup.rightWeight}</div>
            </div>
            <button className={RLDStyle.fillBtn} onClick={() => handleAutoFill(idx)}>
              Fill
            </button>
          </div>
        ))}

        {/* + Add lineup button */}
        <div className={RLDStyle.addBoatBtn} onClick={handleAddBoat} title="Add lineup">
          <span>+</span>
        </div>
      </div>

    </div>
  );
}
import { useState } from "react";
import "../App.css";
import { Lineup} from "../lineup.js";
import LineupGrid from "./LineupGrid.jsx";

export default function BoatHeats({
  boatType,
  numHeats,
  roster
}) {

  const [lineups, setLineups] = useState(() => {
    const map = new Map();
    for (let i = 0; i < numHeats; i++) {
      map.set(i, new Lineup());
    }
    return map;
  });

  const movePerson = ({ from, to }) => {

    // SAME HEAT SWAP
    if (
      from.type === "heat" &&
      to.type === "heat" &&
      from.heatIdx === to.heatIdx
    ) {
      const idx = from.heatIdx;
      const lineup = lineups.get(idx);

      const newLineup = new Lineup();
      newLineup.grid = lineup.grid.map(r => [...r]);
      newLineup.leftWeight = lineup.leftWeight;
      newLineup.rightWeight = lineup.rightWeight;
      newLineup.peopleSet = new Set(lineup.peopleSet); // <-- copy peopleSet

      newLineup.swapPerson(from.row, from.col, to.row, to.col);

      const updatedMap = new Map(lineups);
      updatedMap.set(idx, newLineup);
      setLineups(updatedMap);
      return;
    }

    // DIFFERENT HEAT SWAP
    if (from.type === "heat" && to.type === "heat") {
      const fromLineup = lineups.get(from.heatIdx);
      const toLineup = lineups.get(to.heatIdx);

      const fromPerson = fromLineup.grid[from.row][from.col];
      const toPerson = toLineup.grid[to.row][to.col];

      // both empty, nothing to move
      if (!fromPerson && !toPerson) return;

      const newFrom = new Lineup();
      newFrom.grid = fromLineup.grid.map(r => [...r]);
      newFrom.leftWeight = fromLineup.leftWeight;
      newFrom.rightWeight = fromLineup.rightWeight;
      newFrom.peopleSet = new Set(fromLineup.peopleSet); // <-- copy peopleSet

      const newTo = new Lineup();
      newTo.grid = toLineup.grid.map(r => [...r]);
      newTo.leftWeight = toLineup.leftWeight;
      newTo.rightWeight = toLineup.rightWeight;
      newTo.peopleSet = new Set(toLineup.peopleSet); // <-- copy peopleSet

      // CASE 1: swap
      if (fromPerson && toPerson) {
        newFrom.removePerson(from.row, from.col);
        newTo.removePerson(to.row, to.col);

        newFrom.addPerson(from.row, from.col, toPerson);
        newTo.addPerson(to.row, to.col, fromPerson);
      } 
      // CASE 2: move from to to
      else if (fromPerson && !toPerson) {
        newFrom.removePerson(from.row, from.col);
        newTo.addPerson(to.row, to.col, fromPerson);
      }
      // CASE 3: move to to from 
      else if (!fromPerson && toPerson) {
        newTo.removePerson(to.row, to.col);
        newFrom.addPerson(from.row, from.col, toPerson);
      }

      const updatedMap = new Map(lineups);
      updatedMap.set(from.heatIdx, newFrom);
      updatedMap.set(to.heatIdx, newTo);
      setLineups(updatedMap);
      return;
    }

    // ROSTER TO HEAT
    if (from.type === "sorted" && to.type === "heat") {
      const peopleArray = roster.getAll();
      const index = from.row * 2 + from.col;
      const person = peopleArray[index];
      if (!person) return;

      const lineup = lineups.get(to.heatIdx);
      const newLineup = new Lineup();
      newLineup.grid = lineup.grid.map(r => [...r]);
      newLineup.leftWeight = lineup.leftWeight;
      newLineup.rightWeight = lineup.rightWeight;
      newLineup.peopleSet = new Set(lineup.peopleSet); // <-- copy peopleSet

      newLineup.removePerson(to.row, to.col);
      newLineup.addPerson(to.row, to.col, person);

      const updatedMap = new Map(lineups);
      updatedMap.set(to.heatIdx, newLineup);
      setLineups(updatedMap);
      return;
    }

    // HEAT TO ROSTER
    if (from.type === "heat" && to.type === "sorted") {
      const lineup = lineups.get(from.heatIdx);
      const person = lineup.grid[from.row][from.col];
      if (!person) return;

      const newLineup = new Lineup();
      newLineup.grid = lineup.grid.map(r => [...r]);
      newLineup.leftWeight = lineup.leftWeight;
      newLineup.rightWeight = lineup.rightWeight;
      newLineup.peopleSet = new Set(lineup.peopleSet); // <-- copy peopleSet
      newLineup.removePerson(from.row, from.col);

      const updatedMap = new Map(lineups);
      updatedMap.set(from.heatIdx, newLineup);
      setLineups(updatedMap);
    }
  };


  const dragHandler = (meta, row, col) => ({
    onDragStart: e => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ ...meta, row, col })
      );
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
      );

      movePerson({
        from,
        to: { ...meta, row, col }
      });
    }
  });


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
        {Array.from(lineups).map(([idx, lineup]) => (
          <div className="item" key={idx}>
            <LineupGrid
              title={"Heat " + (idx + 1)}
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

        <div className="item people-item">
          <LineupGrid
            title="People"
            grid={getPeopleGrid(roster)}
            gridMeta={{ type: "sorted" }}
            dragHandler={dragHandler}
          />
        </div>
      </div>
    </div>
  );
}
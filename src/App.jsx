import { useState } from "react";
import "./App.css";
import { Person, Lineup, SortedArray } from "./lineup.js";
import Papa from "papaparse";
import LineupGrid from "./components/LineupGrid.jsx";

function App() {

  const num_heats = 3
  const compareByWeight = (a, b) => a.weight - b.weight;
  const [peoples, setPeoples] = useState(
    () => new SortedArray(compareByWeight)
  );
  const [lineups, setLineups] = useState(() => {
    const map = new Map();
    for (let i = 0; i < num_heats; i++) {
      map.set(i, new Lineup());
    }
    return map;
  });



  const populatePeople = event => {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: results => {
        const next = new SortedArray(compareByWeight);
        peoples.getAll().forEach(p => next.add(p));
        results.data.forEach(row => {
          if (!row.name) return;
          next.add(new Person(row.name, parseFloat(row.weight)));
        });
        setPeoples(next);
      }
    });
  };

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

      const newTo = new Lineup();
      newTo.grid = toLineup.grid.map(r => [...r]);
      newTo.leftWeight = toLineup.leftWeight;
      newTo.rightWeight = toLineup.rightWeight;

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
    // SORTED TO HEAT
    if (from.type === "sorted" && to.type === "heat") {
      const peopleArray = peoples.getAll();
      const index = from.row * 2 + from.col;
      const person = peopleArray[index];
      if (!person) return;

      const newSorted = new SortedArray(compareByWeight);
      peopleArray.forEach(p => p !== person && newSorted.add(p));
      setPeoples(newSorted);

      const lineup = lineups.get(to.heatIdx);
      const newLineup = new Lineup();
      newLineup.grid = lineup.grid.map(r => [...r]);
      newLineup.leftWeight = lineup.leftWeight;
      newLineup.rightWeight = lineup.rightWeight;

      newLineup.removePerson(to.row, to.col);
      newLineup.addPerson(to.row, to.col, person);

      const updatedMap = new Map(lineups);
      updatedMap.set(to.heatIdx, newLineup);
      setLineups(updatedMap);
      return;
    }

    // HEAT TO SORTED
    if (from.type === "heat" && to.type === "sorted") {
      const lineup = lineups.get(from.heatIdx);
      const person = lineup.grid[from.row][from.col];
      if (!person) return;

      const newLineup = new Lineup();
      newLineup.grid = lineup.grid.map(r => [...r]);
      newLineup.leftWeight = lineup.leftWeight;
      newLineup.rightWeight = lineup.rightWeight;
      newLineup.removePerson(from.row, from.col);

      const updatedMap = new Map(lineups);
      updatedMap.set(from.heatIdx, newLineup);
      setLineups(updatedMap);

      const newSorted = new SortedArray(compareByWeight);
      peoples.getAll().forEach(p => newSorted.add(p));
      newSorted.add(person);
      setPeoples(newSorted);
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
    <div className="app-container">
      <h1>Dragon Boat Lineup</h1>

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
            grid={getPeopleGrid(peoples)}
            gridMeta={{ type: "sorted" }}
            dragHandler={dragHandler}
          />
        </div>
      </div>


      <div className="lineup-container">
        
        <div>
          <label>
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={populatePeople}
              style={{ display: "none" }}
            />
          </label>
        </div>

      </div>
    </div>
  );
}

export default App;

import { useState } from "react";
import "./App.css";
import { Person, Lineup, SortedArray } from "./lineup.js";
import Papa from "papaparse";
import LineupGrid from "./components/LineupGrid.jsx";

function App() {

  const num_heats = 2
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

    // swapping with same heat
    if (from.grid === to.grid) {
      const idx = parseInt(to.grid.split(",")[1]) - 1;
      const newLineup = new Lineup();
      const lineupToUpdate = lineups.get(idx)
      newLineup.grid = lineupToUpdate.grid.map(r => [...r]);
      newLineup.leftWeight = lineupToUpdate.leftWeight;
      newLineup.rightWeight = lineupToUpdate.rightWeight;
      newLineup.swapPerson(from.row, from.col, to.row, to.col);
      const updatedMap = new Map(lineups);
      updatedMap.set(idx, newLineup);
      setLineups(updatedMap);
      return;
    }
    
    // to do bewtween different heats
    if (from.grid.includes("heat") && to.grid.includes("heat")) {
      const fromIdx = parseInt(from.grid.split(",")[1]) - 1;
      const toIdx = parseInt(to.grid.split(",")[1]) - 1;
      const fromLineup = lineups.get(fromIdx);
      const toLineup = lineups.get(toIdx);
      
      const fromPerson = fromLineup.grid[from.row][from.col]
      const toPerson = toLineup.grid[to.row][to.col]

      const newFromLineup = new Lineup();
      newFromLineup.grid = fromLineup.grid.map(r => [...r]);
      newFromLineup.addPerson(from.row, from.col, toPerson)

      const newToLineup = new Lineup();
      newToLineup.grid = toLineup.grid.map(r => [...r]);
      newToLineup.leftWeight = toLineup.leftWeight;
      newToLineup.rightWeight = toLineup.rightWeight;
      newToLineup.addPerson(to.row, to.col, fromPerson);
      
      const updatedMap = new Map(lineups);
      updatedMap.set(fromIdx, newFromLineup);
      updatedMap.set(toIdx, newToLineup);
      setLineups(updatedMap);
      return;
    }

    if (from.grid === "sorted" && to.grid.includes("heat")) {
      const peopleArray = peoples.getAll();
      const index = from.row * 2 + from.col;
      const person = peopleArray[index];
      if (!person) return;

      const newSorted = new SortedArray(compareByWeight);
      peopleArray.forEach(p => {
        if (p !== person) newSorted.add(p);
      });
      setPeoples(newSorted);

      const idx = parseInt(to.grid.split(",")[1]) - 1;
      const lineupToUpdate = lineups.get(idx);
      const newLineup = new Lineup();
      newLineup.grid = lineupToUpdate.grid.map(r => [...r]);
      newLineup.leftWeight = lineupToUpdate.leftWeight;
      newLineup.rightWeight = lineupToUpdate.rightWeight;

      newLineup.removePerson(to.row, to.col);
      newLineup.addPerson(to.row, to.col, person);

      const updatedMap = new Map(lineups);
      updatedMap.set(idx, newLineup);
      setLineups(updatedMap);
      return;
    }
      // Heat to Sorted
    if (from.grid.includes("heat") && to.grid === "sorted") {
      const idx = parseInt(from.grid.split(",")[1]) - 1;
      const lineupFrom = lineups.get(idx);
      const person = lineupFrom.grid[from.row][from.col];
      if (!person) return;

      // Remove from lineup
      const newLineup = new Lineup();
      newLineup.grid = lineupFrom.grid.map(r => [...r]);
      newLineup.leftWeight = lineupFrom.leftWeight;
      newLineup.rightWeight = lineupFrom.rightWeight;
      newLineup.removePerson(from.row, from.col);

      const updatedMap = new Map(lineups);
      updatedMap.set(idx, newLineup);
      setLineups(updatedMap);

      // Add to sorted
      const newSorted = new SortedArray(compareByWeight);
      peoples.getAll().forEach(p => newSorted.add(p));
      newSorted.add(person);
      setPeoples(newSorted);
      return;
    }
  };

  const dragHandler = (gridType, row, col) => ({
    onDragStart: e => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ grid: gridType, row, col })
      );
    },

    onDragEnter: e => {
      e.preventDefault();
    },

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
        to: { grid: gridType, row, col }
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
              title={"heat," + (idx + 1)}
              grid={lineup.grid}
              gridType={"heat," + (idx + 1)}
              dragHandler={dragHandler}
            />
            <p>
              Left Side Weight: {lineup.leftWeight} | Right Side Weight: {lineup.rightWeight}
            </p>
          </div>
        ))}

        <div className="item people-item">
          <LineupGrid
            title="People"
            grid={getPeopleGrid(peoples)}
            gridType="sorted"
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

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
    if (from.grid === "main" && to.grid === "main") {
      const newLineup = new Lineup();
      newLineup.grid = lineup.grid.map(r => [...r]);
      newLineup.leftWeight = lineup.leftWeight;
      newLineup.rightWeight = lineup.rightWeight;
      newLineup.swapPerson(from.row, from.col, to.row, to.col);
      setLineup(newLineup);
    }

    if (from.grid === "sorted" && to.grid === "main") {
      const peopleArray = peoples.getAll();
      const index = from.row * 2 + from.col;
      const person = peopleArray[index];
      if (!person) return;

      const newSorted = new SortedArray(compareByWeight);
      peopleArray.forEach(p => {
        if (p !== person) newSorted.add(p);
      });
      setPeoples(newSorted);

      const newLineup = new Lineup();
      newLineup.grid = lineup.grid.map(r => [...r]);
      newLineup.leftWeight = lineup.leftWeight;
      newLineup.rightWeight = lineup.rightWeight;
      newLineup.removePerson(to.row, to.col);
      newLineup.addPerson(to.row, to.col, person);
      setLineup(newLineup);
    }

    if (from.grid == "main" && to.grid == "sorted") {
      const person = lineup.grid[from.row][from.col];
      if (!person) return;

      const newLineup = new Lineup();
      newLineup.grid = lineup.grid.map(r => [...r]);
      newLineup.leftWeight = lineup.leftWeight;
      newLineup.rightWeight = lineup.rightWeight;
      newLineup.removePerson(from.row, from.col);
      setLineup(newLineup);

      const newSorted = new SortedArray(compareByWeight);
      peoples.getAll().forEach(p => {
        if (p !== person) newSorted.add(p);
      });
      newSorted.add(person);
      setPeoples(newSorted);
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
      e.preventDefault(); // 🔴 REQUIRED
    },

    onDragOver: e => {
      e.preventDefault(); // 🔴 REQUIRED
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

        <div className = "lineup-container">
          {Array.from(lineups).map(([idx, lineup]) => (
            <div className="item" key = {idx}>
              <LineupGrid
              title={"heat " + (idx + 1)}
              grid={lineup.grid}
              gridType="main"
              dragHandler={dragHandler}
              />

              <p>
                Left Side Weight: {lineup.leftWeight} | Right Side Weight:{" "}
                {lineup.rightWeight}
              </p>
            </div>
          ))}
        </div>

        <div className="scroll-container">
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

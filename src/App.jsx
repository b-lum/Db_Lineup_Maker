import { useState } from 'react'
import './App.css'
import { Person, Lineup, SortedArray } from "./lineup.js"
import Papa from "papaparse";


function App() {
  const [lineup, setLineup] = useState(() => {
    const l = new Lineup();
    l.addPerson(5, 0, new Person("Alice", 150, 12));
    l.addPerson(5, 1, new Person("Bob", 180, 15));
    return l;
  });

  const compareByWeight = ( person1, person2 ) => {
    return person1.weight - person2.weight;
  }

  const [peoples, setPeoples] = useState(new SortedArray(compareByWeight));
    
  const populatePeople = (event) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      complete : (results) => {
        const newPeoples = new SortedArray(compareByWeight);
        peoples.getAll().forEach(p => newPeoples.add(p));
        results.data.forEach(row => {
          const person = new Person(row.name, parseFloat(row.weight))
          newPeoples.add(person)
        });
        setPeoples(newPeoples)
      }
    });
  }

  const dragHandler = (gridType, row, col) => {
    return {
      onDragStart: e => {
        e.dataTransfer.setData(
          "text/plain",
          JSON.stringify({ gridType, row, col })
        )
      },
      onDragOver: e => e.preventDefault(),
      onDrop: e => {
        e.preventDefault();
        const source = JSON.parse(e.dataTransfer.getData("text/plain"));

        if (source.gridType === "main" && gridType === "main") {
          // Main → Main: swap
          const newLineup = new Lineup();
          newLineup.grid = lineup.grid.map(r => [...r]);
          newLineup.leftWeight = lineup.leftWeight;
          newLineup.rightWeight = lineup.rightWeight;
          newLineup.swapPerson(source.row, source.col, row, col);
          setLineup(newLineup);
        } else if (source.gridType === "sorted" && gridType === "main") {
          // Sorted → Main: move
          const peopleArray = peoples.getAll();
          const person = peopleArray[source.row * 2 + source.col];
          if (!person) return;

          // remove from sorted
          const newSorted = new SortedArray(compareByWeight);
          peopleArray.forEach(p => {
            if (p !== person) newSorted.add(p);
          });
          setPeoples(newSorted);

          // add to main lineup
          const newLineup = new Lineup();
          newLineup.grid = lineup.grid.map(r => [...r]);
          newLineup.leftWeight = lineup.leftWeight;
          newLineup.rightWeight = lineup.rightWeight;
          newLineup.addPerson(row, col, person);
          setLineup(newLineup);
        }
      }
    }
  }


  const getPeopleGrid = (sortedArray) => {
    const people = sortedArray.getAll();
    const mid = Math.ceil((people.length / 2) + 1);
    const topRow = people.slice(0, mid);
    const bottomRow = people.slice(mid);

    // pad rows with null if needed
    if (topRow.length < bottomRow.length) topRow.push(null);
    if (bottomRow.length < topRow.length) bottomRow.push(null);

    return [topRow, bottomRow];
  }

  return (
    <div className="app-container">
      <h1>Dragon Boat Lineup</h1>

      <div className="lineup-container">
        <div className="lineup-grid">
          {lineup.grid.map((row, i) => (
            <div className="lineup-row" key={i}>
              {row.map((p, j) => (
                <div className="lineup-cell" key={j} draggable={!!p} {...dragHandler("main", i, j)}>
                  {p ? (
                    <>
                      <span className="person-name">{p.name}</span> <br />
                      {p.weight} lbs
                    </>
                  ) : (
                    "empty"
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="lineup-grid">
          {getPeopleGrid(peoples).map((row, i) => (
            <div className="lineup-row" key={i}>
              {row.map((p, j) => (
                <div className="lineup-cell" key={j} draggable={!!p} {...dragHandler("sorted", i, j)}>
                  {p ? (
                    <>
                      <span className="person-name">{p.name}</span> <br />
                      {p.weight} lbs
                    </>
                  ) : (
                    "empty"
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>


      <p>
        Left Side Weight: {lineup.leftWeight} | Right Side Weight: {lineup.rightWeight}
      </p>

      <label>
        Upload CSV
        <input 
          type="file" 
          accept=".csv" 
          onChange={populatePeople} 
          style={{ display: 'none' }} 
        />
      </label>
    </div>
  );
}

export default App;

import { useState } from "react";
import { Person, SortedArray } from "./lineup.js"
import Papa from "papaparse";
import BoatHeats from "./components/BoatHeats.jsx";
import "./App.css";

function App() {

   const compareByWeight = (a, b) => a.weight - b.weight;

   const [roster, setRoster] = useState(
      () => new SortedArray(compareByWeight)
   )

   const [boatTypes, setBoatTypes] = useState (() => new Map())

   const populateRoster = event => {
      const file = event.target.files[0];
      Papa.parse(file, {
         header: true,
         complete: results => {
            const next = new SortedArray(compareByWeight);
            roster.getAll().forEach(p => next.add(p));
            results.data.forEach(row => {
               if (!row.name) return;
               next.add(new Person(row.name, parseFloat(row.weight)));
            });
            setRoster(next);
         }
      });
   };

  return (

   <div className="app-container">

      <h1> Dragon Boat Lineup</h1>

      <label className="upload-label">
         Upload Roster (CSV)
         <input
            type="file"
            accept=".csv"
            onChange={populateRoster}
            style={{ display: "none" }}
         />
      </label>

      <BoatHeats
         boatType="standard"
         numHeats={3}
         roster={roster}
      />
   </div>
  )
}

export default App;
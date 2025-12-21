import { useState } from "react";
import { Person } from "./data_objects/Person.js"
import { SortedArray } from "./data_objects/SortedArray.js"
import { Heats } from "./data_objects/Heats.js";
import Papa from "papaparse";
import BoatHeats from "./react_components/BoatHeats.jsx";
import "./App.css";

function App() {

   const compareByWeight = (a, b) => a.weight - b.weight;

   const [roster, setRoster] = useState(
      () => new SortedArray(compareByWeight)
   )
   const [boats, setBoats] = useState (() => new Map())

   const [boatInputs, setBoatInputs] = useState([""]);
   const [activeBoat, setActiveBoat] = useState(null);


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

   const updateBoatInput = (i, value) => {
      const nextInputs = [...boatInputs];
      nextInputs[i] = value;

      // Always keep one empty input at the end
      if (i === boatInputs.length - 1 && value.trim() !== "") {
         nextInputs.push("");
      }

      setBoatInputs(nextInputs);

      // Rebuild boats Map
      const nextBoats = new Map();
      nextInputs
         .map(v => v.trim())
         .filter(v => v !== "")
         .forEach(name => {
            nextBoats.set(name, new Heats(name, 2) );
         });

      setBoats(nextBoats);
   };

   const handleBoatClick = (boatName) => {
      setActiveBoat(boatName);
   };

   return (

      <div className="app-container">

         <h1> Dragon Boat Lineup Maker</h1>

         <div className="boat-list">
            {boatInputs.map((value, i) => (
               <input
                  key={i}
                  value={value}
                  placeholder={i === boatInputs.length - 1 ? "Add boat…" : ""}
                  onChange={e => updateBoatInput(i, e.target.value)}
               />
            ))}
         </div>

         <label className="upload-label">
            Upload Roster (CSV)
            <input
               type="file"
               accept=".csv"
               onChange={populateRoster}
               style={{ display: "none" }}
            />
         </label>

         <div>
            {Array.from(boats.entries()).map(([name, heats]) => (
               <button key={name} onClick={() => handleBoatClick(name)}>
                  {name}
               </button>
            ))}
         </div>

         <div>
            {activeBoat && boats.has(activeBoat) && (
               <BoatHeats
                  heats={boats.get(activeBoat)}
                  roster={roster}
                  onUpdate={(newHeats) => {
                     const next = new Map(boats);
                     next.set(activeBoat, newHeats);
                     setBoats(next);
                  }}
               />
            )}
         </div>
         
      </div>
   )
}

export default App;


/*
<BoatHeats
            boatType="standard"
            numHeats={3}
            roster={roster}
         />
*/
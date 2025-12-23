import { useState } from "react";
import { Person } from "./data_objects/Person.js"
import { SortedArray } from "./data_objects/SortedArray.js"
import { Heats } from "./data_objects/Heats.js";
import BoatHeats from "./react_components/BoatHeats.jsx";
import CopyButton from "./react_components/CopyButton.jsx";

import Papa from "papaparse";
import "./App.css";

function App() {

   const compareByWeight = (a, b) => a.weight - b.weight;

   const [roster, setRoster] = useState(
      () => new SortedArray(compareByWeight)
   )
   const [boats, setBoats] = useState (() => new Map())

   const [boatInputs, setBoatInputs] = useState([""]);
   const [activeBoat, setActiveBoat] = useState(null);
   const [rosterFileName, setRosterFileName] = useState("No file chosen");


   const populateRoster = event => {
      const file = event.target.files[0];
      if (!file) return;

      setRosterFileName(file.name);

      Papa.parse(file, {
         header: true,
         complete: results => {
            const next = new SortedArray(compareByWeight);
            roster.getAll().forEach(p => next.add(p));
            results.data.forEach(row => {
               if (!row.name) return;
               next.add(new Person(
                  row.name, 
                  parseFloat(row.weight), 
                  row.gender
               ));
            })
            setRoster(next);
         }
      })

      event.target.value = "";
   }

   const updateBoatInput = (i, value) => {
      const nextInputs = [...boatInputs];
      nextInputs[i] = value;

      if (i === boatInputs.length - 1 && value.trim() !== "") {
         nextInputs.push("");
      }

      setBoatInputs(nextInputs);

      setBoats(prevBoats => {
         const nextBoats = new Map(prevBoats);

         const names = nextInputs
            .map(v => v.trim())
            .filter(v => v !== "");

         // add new boats
         for (const name of names) {
            if (!nextBoats.has(name)) {
               nextBoats.set(name, new Heats(name, 2));
            }
         }

         // remove deleted boats
         for (const name of nextBoats.keys()) {
            if (!names.includes(name)) {
            nextBoats.delete(name);
            }
         }

         return nextBoats;
      })
   }

   const handleBoatClick = (boatName) => {
      setActiveBoat(boatName);
   }

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

         <div className="upload-container">
            <label htmlFor="roster-upload" className="upload-label">
               Choose File
            </label>

            <span className="file-status">
               {rosterFileName}
            </span>

            <input
               type="file"
               accept=".csv"
               id="roster-upload"
               onChange={populateRoster}
               style={{ display: "none" }}
            />
         </div>

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

         {activeBoat && boats.has(activeBoat) && (
            <CopyButton text={boats.get(activeBoat).mastersheetStr()} />
         )}
         
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
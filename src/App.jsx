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

   const [boatInputs, setBoatInputs] = useState([
      { name: "", type: "" }
   ]);   
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

   const updateBoatInput = (i, changes) => {
      setBoatInputs(prev => {
         const next = [...prev];
         next[i] = { ...next[i], ...changes };

         if (i === prev.length - 1 && next[i].name.trim() !== "") {
            next.push({ name: "", type: "" });
         }

         setBoats(prevBoats => {
            const nextBoats = new Map();

            for (const { name, type } of next) {   // ✅ use next
               const trimmed = name.trim();
               if (!trimmed) continue;

               if (prevBoats.has(trimmed)) {
                  const prev = prevBoats.get(trimmed);
                  if (prev.boatType !== type) {
                     nextBoats.set(trimmed, new Heats(trimmed, 2, type));
                  } else {
                     nextBoats.set(trimmed, prev);
                     }
               } else {
                  nextBoats.set(trimmed, new Heats(trimmed, 2, type));
               }
            }
            return nextBoats;
         })

         return next;
      })
   }


   const handleBoatClick = (boatName) => {
      setActiveBoat(boatName);
   }

   return (

      <div className="app-container">

         <h1> Dragon Boat Lineup Maker</h1>

         <div className="boat-list">
            {boatInputs.map((boat, i) => (

               <div key={i} className="boat-row">

                  <select
                     value={boat.type}
                     onChange={e => updateBoatInput(i, {type : e.target.value})}
                  >
                     <option value="Open">Open</option>
                     <option value="Womens">Womens</option>
                     <option value="Mixed">Mixed</option>
                  </select>

                  <input
                     value={boat.name}
                     placeholder={i === boatInputs.length - 1 ? "Add boat…" : ""}
                     onChange={e => updateBoatInput(i, { name : e.target.value} )}
                  />

               </div>
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
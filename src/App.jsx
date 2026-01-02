/**
 * App.jsx
 *
 * Main application component for the Dragon Boat Lineup Maker.
 *
 * Responsibilities:
 * - Load and maintain the master roster (from Google Sheets CSV)
 * - Manage boat definitions and their associated heats
 * - Track the currently active boat
 * - Aggregate per-person participation counts across all boats/heats
 * - Coordinate data flow between UI components
 */

import { useState, useEffect, useMemo } from "react";
import { Person } from "./data_objects/Person.js"
import { SortedArray } from "./data_objects/SortedArray.js"
import { BoatHeats } from "./data_objects/BoatHeats.js";
import BoatHeatsDisplay from "./react_components/BoatHeatsDisplay.jsx";
import CopyButton from "./react_components/CopyButton.jsx";
import PersonCounter from "./react_components/PersonCounter.jsx";

import Papa from "papaparse";
import "./App.css";

function App() {

   /**
    * Comparator used by SortedArray to keep the roster ordered by weight.
    */
   const compareByWeight = (a, b) => a.weight - b.weight;

   /**
    * Master roster of all people.
    * Stored as a SortedArray<Person>, ordered by weight.
    */
   const [roster, setRoster] = useState(
      () => new SortedArray(compareByWeight)
   );

   /**
    * Map of boat name -> BoatHeats instance.
    * Represents all boats currently defined in the UI.
    */
   const [boats, setBoats] = useState (() => new Map());

   /**
    * Controlled inputs for boat creation/editing.
    * Always keeps one empty row at the end for easy adding.
    */
   const [boatInputs, setBoatInputs] = useState([
      { name: "", type: "" }
   ]);   

   /**
    * Name of the currently selected boat (or null if none).
    */
   const [activeBoat, setActiveBoat] = useState(null);

   /**
    * Display name for the roster file (currently unused, but reserved).
    */
   const [rosterFileName, setRosterFileName] = useState("No file chosen");


   /**
    * Loads roster data from a public Google Sheets CSV URL.
    * Existing roster entries are preserved and merged.
    *
    * @param {string} csvURL - Public CSV export URL
    */
   const populateRosterFromGoogleSheet = (csvURL) => {
      Papa.parse(csvURL,
      {
         header: true,
         download: true,
         complete: results => {
         const next = new SortedArray(compareByWeight);

            roster.getAll().forEach(p => next.add(p));

            results.data.forEach(row => {
               if (!row.name) return;

               next.add(new Person(
                  row.name, 
                  parseFloat(row.weight), 
                  row.gender
               ))
            })
            setRoster(next);
         }
      })
   }

   /**
    * Effect: periodically reloads the roster from Google Sheets.
    * Runs once on mount and refreshes every 30 seconds.
    */
   useEffect(() => {
      const load = () => {
         populateRosterFromGoogleSheet(
            "https://docs.google.com/spreadsheets/d/e/2PACX-1vR1ZfYkpRQgH5LRrsJPxTGeKe98sQ-pzlMeXcnCrCHNrgjQ6gaNPuv2QAQftLUyLOFMFWpQxlTDg9uu/pub?output=csv"
         )
      };

      load();
      const id = setInterval(load, 30000);
      return () => clearInterval(id);
   }, []);


   /**
    * Memoized map of person name -> number of times they appear
    * across all boats, heats, and lineups.
    *
    * Recomputes only when `boats` changes.
    */
   const personCounts = useMemo(() => {
      const map = new Map();
      for (const boat of boats.values()) {
         for (const lineup of boat.lineups.values()) {
            for (const person of lineup.peopleMap.values()) {
               map.set(person.name, (map.get(person.name) ?? 0) + 1);
            }
         }
      }
      return map
   }, [boats]);



   /**
    * Updates a boat input row and synchronizes the boats Map.
    *
    * - Automatically appends a new empty row when typing into the last row
    * - Preserves existing BoatHeats objects when possible
    * - Recreates BoatHeats if the boat type changes
    *
    * @param {number} i - Index of the boat input row
    * @param {Object} changes - Partial update ({ name?, type? })
    */
   const updateBoatInput = (i, changes) => {
      setBoatInputs(prev => {
         const next = [...prev];
         next[i] = { ...next[i], ...changes };

         if (i === prev.length - 1 && next[i].name.trim() !== "") {
            next.push({ name: "", type: "" });
         }

         setBoats(prevBoats => {
            const nextBoats = new Map();

            for (const { name, type } of next) {
               const trimmed = name.trim();
               if (!trimmed) continue;

               if (prevBoats.has(trimmed)) {
                  const prev = prevBoats.get(trimmed);
                  if (prev.boatType !== type) {
                     nextBoats.set(trimmed, new BoatHeats(trimmed, 3, type));
                  } else {
                     nextBoats.set(trimmed, prev);
                     }
               } else {
                  nextBoats.set(trimmed, new BoatHeats(trimmed, 3, type));
               }
            }
            return nextBoats;
         })

         return next;
      })
   }



   /**
    * Sets the currently active boat by name.
    *
    * @param {string} boatName
    */
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

            <div>
               {Array.from(boats.entries()).map(([name, heats]) => (
                  <button key={name} onClick={() => handleBoatClick(name)}>
                     {name}
                  </button>
               ))}
            </div>
         <div className="heat-count-grid">
            <div className="heat-display">
               {activeBoat && boats.has(activeBoat) && (
                  <BoatHeatsDisplay
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

            <div className="person-count-display">
               <PersonCounter personCounts={personCounts} />
            </div>
         </div>

         {activeBoat && boats.has(activeBoat) && (
            <CopyButton text={boats.get(activeBoat).mastersheetStr()} />
         )}
         
      </div>
   )
}

export default App;
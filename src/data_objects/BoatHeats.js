import { Lineup } from "../lineup_objects/Lineup.js";
import { MixedLineup } from "../lineup_objects/MixedLineup.js";
import { WomensLineup } from "../lineup_objects/WomensLineup.js";


/**
 * Class representing a set of heats for a single boat.
 * Manages multiple Lineup objects per heat and provides methods
 * for moving or swapping participants within and across heats or with a roster.
 */
class BoatHeats {


   /**
    * Create a new BoatHeats instance.
    * Initializes the specified number of heats with the appropriate lineup type.
    * @param {string} boatName - The name of the boat.
    * @param {number} numHeats - The number of heats for this boat.
    * @param {string} boatType - Type of boat lineups: "Lineup", "Mixed", or "Womens".
    */
   constructor(boatName, numHeats, boatType) {
      this.lineups = new Map();
      for (let i = 0; i < numHeats; i++) {
         let lineupType = new Lineup();
         if (boatType === "Mixed") lineupType = new MixedLineup();
         else if (boatType === "Womens") lineupType = new WomensLineup();

         this.lineups.set(i, lineupType);
      }
      this.boatName = boatName;
      this.numHeats = numHeats;
      this.boatType = boatType;
      console.log(`Created Heats object for boat "${this.boatName}" with type "${this.boatType}" and ${this.numHeats} heats.`);

   }

   /**
    * Replace or update a lineup at a specific heat index.
    * @param {number} i - Heat index (0-based).
    * @param {Lineup} lineup - The Lineup object to set for this heat.
    */
   addLineup(i, lineup) {
      this.lineups.set(i, lineup);
   }

   /**
    * Move or swap a person between heats or between a heat and a roster.
    * Supports multiple cases:
    *   - Swap within the same heat
    *   - Swap across different heats
    *   - Move from roster to heat
    *   - Move from heat to roster
    * @param {Object} param0 - Object describing the move.
    * @param {Object} param0.from - Source location of the person.
    * @param {Object} param0.to - Destination location of the person.
    * @param {Object} roster - Roster object providing a getAll() method to access all participants.
    */
   movePerson({ from, to }, roster) {
      // SAME HEAT SWAP
      if (
         from.type === "heat" &&
         to.type === "heat" &&
         from.heatIdx === to.heatIdx
      ) {
         const idx = from.heatIdx;
         const lineup = this.lineups.get(idx);
         lineup.swapPerson(from.row, from.col, to.row, to.col);
         return;
      }
      
      // DIFFERENT HEAT SWAP
      if (from.type === "heat" && to.type === "heat") {
         const fromLineup = this.lineups.get(from.heatIdx);
         const toLineup = this.lineups.get(to.heatIdx);
      
         const fromPerson = fromLineup.grid[from.row][from.col];
         const toPerson = toLineup.grid[to.row][to.col];
      
         // both empty nothing to move
         if (!fromPerson && !toPerson) return;
      
         // CASE 1: swap
         if (fromPerson && toPerson) {
            fromLineup.removePerson(from.row, from.col);
            toLineup.removePerson(to.row, to.col);
      
            fromLineup.addPerson(from.row, from.col, toPerson);
            toLineup.addPerson(to.row, to.col, fromPerson);
         } 
         // CASE 2: move from to to
         else if (fromPerson && !toPerson) {
            fromLineup.removePerson(from.row, from.col);
            toLineup.addPerson(to.row, to.col, fromPerson);
         }
         // CASE 3: move to to from 
         else if (!fromPerson && toPerson) {
            toLineup.removePerson(to.row, to.col);
            fromLineup.addPerson(from.row, from.col, toPerson);
         }
         return;
      }
      
      // ROSTER TO HEAT
      if (from.type === "sorted" && to.type === "heat") {
         const peopleArray = roster.getAll();
         const index = from.row * 25 + from.col;
         const person = peopleArray[index];
         if (!person) return;
      
         const lineup = this.lineups.get(to.heatIdx);
      
         lineup.removePerson(to.row, to.col);
         lineup.addPerson(to.row, to.col, person);
      
         return;
      }
      
      // HEAT TO ROSTER
      if (from.type === "heat" && to.type === "sorted") {
         const lineup = this.lineups.get(from.heatIdx);
         const person = lineup.grid[from.row][from.col];
         if (!person) return;
      
         lineup.removePerson(from.row, from.col);
         return;
      }
   }

   /**
    * Create a shallow clone of the current BoatHeats instance.
    * Each lineup is also cloned to produce independent lineups.
    * @returns {BoatHeats} A new BoatHeats instance with cloned lineups.
    */
   clone() {
      const copy = new BoatHeats(this.boatName, this.numHeats, this.boatType);
      copy.lineups = new Map();

      for (const [idx, lineup] of this.lineups) {
         copy.lineups.set(idx, lineup.clone());
      }

      return copy;
   }

   /**
    * Generate a string representation of all heats for a master sheet.
    * Combines each heat's lineup into a tab-separated format.
    * @returns {string} Master sheet representation of all heats for this boat.
    */
   mastersheetStr() {

      const lineupsArr = Array.from(this.lineups.values());
      if (lineupsArr.length === 0) return "";

      let lineupTitleLine = ""; // I forgot about this... make this neater later 
      const numRows = lineupsArr[0].mastersheetStr().length;
      const rows = new Array(numRows).fill("").map(() => "");

      for (let i = 0; i < lineupsArr.length; i++) {
         lineupTitleLine += `${this.boatType} Heat ${i+1}\t\t\t\t`;
         const lineupRows = lineupsArr[i].mastersheetStr();
         for (let j = 0; j < lineupRows.length; j++) {
            rows[j] += lineupRows[j] + "\t\t";
         }
      }

      return lineupTitleLine + "\n" + rows.join("\n");
   }
   
}

export { BoatHeats };
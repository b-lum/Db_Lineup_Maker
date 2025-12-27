import { Lineup } from "../lineup_objects/Lineup.js";
import { MixedLineup } from "../lineup_objects/MixedLineup.js";
import { WomensLineup } from "../lineup_objects/WomensLineup.js";

class BoatHeats {

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

   addLineup(i, lineup) {
      this.lineups.set(i, lineup);
   }

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
         const index = from.row * 2 + from.col;
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

   clone() {
      const copy = new BoatHeats(this.boatName, this.numHeats, this.boatType);
      copy.lineups = new Map();

      for (const [idx, lineup] of this.lineups) {
         copy.lineups.set(idx, lineup.clone());
      }

      return copy;
   }

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
import { Lineup } from "../lineup_objects/Lineup.js";

class PracticeLayout {

   constructor(numLineups) {
      this.lineups = new Map();
      for (let i = 0; i < numLineups; i++) {
         this.lineups.set(i, new Lineup());
      }
      this.numLineups = numLineups;
      console.log(`Created boat "${this.numLineups}" lineups for this practice session`);
   }

   /**
    * Replace or update a lineup at a specific heat index.
    * @param {number} i - Heat index (0-based).
    * @param {Lineup} lineup - The Lineup object to set for this heat.
    */
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
         const index = from.row;
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

}
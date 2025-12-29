import { Lineup } from "./Lineup";
import { Person } from "../data_objects/Person";

/**
 * Class representing an all-women dragon boat lineup.
 * Extends the Lineup class and restricts adding only female participants
 * (except for the first row, which can be any gender for roles like caller or steer).
 */
class WomensLineup extends Lineup {

   /**
    * Add a person to the lineup grid at a specified row and column.
    * Only allows females for rows other than the first row.
    * @param {number} row - The row index (0-based) to place the person.
    * @param {number} col - The column index (0 for left, 1 for right) to place the person.
    * @param {Person} person - The Person object to add.
    * @returns {boolean} True if added successfully, false if invalid or not female.
    */
   addPerson(row, col, person) {
      if (person?.gender == "female" || row === 0) {
         return super.addPerson(row, col, person);
      }
      
      console.log(`Failed to add ${person.name}, only women on this boat`)
      return false;
   }

   /**
    * Create a shallow clone of the current WomensLineup.
    * Copies the grid, peopleSet, and total weights.
    * @returns {WomensLineup} A new WomensLineup instance with the same people and weights.
    */
   clone() {
      const l = new WomensLineup();
      l.grid = this.grid.map(r => [...r]);
      l.leftWeight = this.leftWeight;
      l.rightWeight = this.rightWeight;
      l.peopleSet = new Set(this.peopleSet);
      return l;
   }
}

export { WomensLineup };
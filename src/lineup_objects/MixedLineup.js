import { Lineup } from "./Lineup.js"


/**
 * Class representing a mixed-gender dragon boat lineup.
 * Extends the Lineup class to enforce gender restrictions:
 * maximum 10 men and 10 women on the boat (excluding first row).
 */
class MixedLineup extends Lineup {
   /**
    * Create a new MixedLineup.
    * Initializes counters for girls and guys in addition to the base Lineup.
    */
   constructor() {
      super();
      /** @type {number} Number of girls currently on the boat (excluding first row). */
      this.girlCount = 0; // max 10 girls
      /** @type {number} Number of guys currently on the boat (excluding first row). */
      this.guyCount = 0; // max 10 guys
   }


   /**
    * Add a person to the lineup grid at a specified row and column.
    * Enforces gender restrictions (max 10 men, max 10 women) for rows other than the first row.
    * @param {number} row - The row index (0-based) to place the person.
    * @param {number} col - The column index (0 for left, 1 for right) to place the person.
    * @param {import("./../data_objects/Person.js").Person} person - The Person object to add.
    * @returns {boolean} True if added successfully, false if invalid, duplicate, or gender limit reached.
    */
   addPerson(row, col, person) {
      if (row === 0) {
         return super.addPerson(row, col, person);
      }

      const gender = person.gender;

      if (gender === "male") {
         if (this.guyCount >= 10) {
            console.log(`Failed to add ${person.name}, ${this.guyCount} men already on boat`);
            return false;
         } else {
            const wasAdded = super.addPerson(row, col, person);
            if (!wasAdded) return false;
            
            this.guyCount += 1;
            //console.log(`Successfully added ${person.name}`);
            return true;
         }
      } else if (gender === "female") {
         if (this.girlCount >= 10) {
            console.log(`Failed to add ${person.name}, ${this.girlCount} women already on boat`);
            return false;
         } else {
            const wasAdded = super.addPerson(row, col, person);
            if (!wasAdded) return false;

            this.girlCount += 1;
            //console.log(`Successfully added ${person.name}`);
            return true;
         }

      }

   }

   /**
    * Remove a person from the lineup at a specified row and column.
    * Updates gender counters if the removed person is male or female and row is not the first row.
    * @param {number} row - The row index (0-based) of the person to remove.
    * @param {number} col - The column index (0 for left, 1 for right) of the person to remove.
    */
   removePerson(row, col) {

      if (row === 0) {
         return super.removePerson(row, col);
      }

      const person = this.grid[row][col];

      if (person !== null && person.gender === "male") {
         this.guyCount -= 1;
      } if (person !== null && person.gender === "female") {
         this.girlCount -= 1;
      }
      
      return super.removePerson(row, col);
   }

   /**
    * Create a shallow clone of the current MixedLineup.
    * Copies the grid, peopleSet, weights, and gender counters.
    * @returns {MixedLineup} A new MixedLineup instance with the same people, weights, and gender counts.
    */
   clone() {
      const l = new MixedLineup();
      l.grid = this.grid.map(r => [...r]);
      l.leftWeight = this.leftWeight;
      l.rightWeight = this.rightWeight;
      l.peopleSet = new Set(this.peopleSet);
      l.girlCount = this.girlCount;
      l.guyCount = this.guyCount;
      return l;
   }

}

export { MixedLineup };
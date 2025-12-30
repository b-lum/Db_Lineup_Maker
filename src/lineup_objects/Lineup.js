import { Person } from "../data_objects/Person.js"; 

/**
 * Class representing a dragon boat lineup.
 * Maintains a grid of Person objects, tracks total weights on each side,
 * and provides utility methods to add, remove, swap, and display the lineup.
 */
class Lineup {

   /**
    * Create a new Lineup.
    * Initializes an 11x2 grid (rows x columns), a set to track unique people,
    * and total left and right side weights.
    */
   constructor() {
      const rows = 11
      const cols = 2
      this.peopleMap = new Map();
      this.grid = Array.from({length : rows}, () => Array(cols).fill(null));
      this.leftWeight = 0
      this.rightWeight = 0
   }

   /**
    * Add a person to the lineup grid at a specified row and column.
    * Updates total left/right weight if row is not the first row.
    * @param {number} row - The row index (0-based) to place the person.
    * @param {number} col - The column index (0 for left, 1 for right) to place the person.
    * @param {Person} person - The Person object to add.
    * @returns {boolean} True if added successfully, false if invalid or duplicate.
    * @throws {Error} If row or column is out of bounds.
    */
   addPerson(row, col, person) {
      // Check for null or duplicate by name
      if (person === null || this.peopleMap.has(person.name)) {
         console.log(`Cannot add ${person?.name || "null"}: already in lineup or invalid`);
         return false; 
      }

      // Bounds check
      if (row < 0 || row >= this.grid.length || col < 0 || col >= this.grid[0].length) {
         throw new Error("Invalid row or column");
      }

      // Add person to grid
      this.grid[row][col] = person;
      this.peopleMap.set(person.name, person);

      // Update weights if not in first row
      if (row !== 0) {
         if (col === 0) this.leftWeight += person.weight;
         else if (col === 1) this.rightWeight += person.weight;
      }

      console.log(`Added ${person.name} to row ${row}, column ${col}`);
      return true;
   }

   /**
    * Remove a person from the lineup at a specified row and column.
    * Updates total left/right weight if row is not the first row.
    * @param {number} row - The row index (0-based) of the person to remove.
    * @param {number} col - The column index (0 for left, 1 for right) of the person to remove.
    */
   removePerson(row, col) {
      let p = this.grid[row][col];
      
      if (p !== null) {
         if (col === 0 && row !== 0) this.leftWeight -= p.weight;
         else if (col === 1 && row !== 0) this.rightWeight -= p.weight;

         this.grid[row][col] = null
         this.peopleMap.delete(p.name);
      
         console.log(`Removed ${p.name} from row ${row}, column ${col}`);
      } else {
         console.log(`No person to remove at row ${row}, column ${col}`);
      }
   }

   /**
    * Swap two people within the lineup grid.
    * Adjusts total left/right weights accordingly.
    * @param {number} row1 - Row index of the first person.
    * @param {number} col1 - Column index of the first person.
    * @param {number} row2 - Row index of the second person.
    * @param {number} col2 - Column index of the second person.
    * @throws {Error} If any row or column index is out of bounds.
    */
   swapPerson(row1, col1, row2, col2) {
      // Bounds check
      if (row1 < 0 || row1 >= this.grid.length || col1 < 0 || col1 >= this.grid[0].length ||
         row2 < 0 || row2 >= this.grid.length || col2 < 0 || col2 >= this.grid[0].length) {
         throw new Error("Invalid row or column");
      }

      let p1 = this.grid[row1][col1];
      let p2 = this.grid[row2][col2];

      // Update weights: remove old weights if row != 0
      //if (row1 !== 0 && col1 === 0 && p1) this.leftWeight -= p1.weight;
      //if (row1 !== 0 && col1 === 1 && p1) this.rightWeight -= p1.weight;
      //if (row2 !== 0 && col2 === 0 && p2) this.leftWeight -= p2.weight;
      //if (row2 !== 0 && col2 === 1 && p2) this.rightWeight -= p2.weight;
      
      // Swap in grid
      if (p1) this.removePerson(row1, col1);
      if (p2) this.removePerson(row2, col2);
      if (p1) this.addPerson(row2, col2, p1);
      if (p2) this.addPerson(row1, col1, p2);

      // Update weights: add new weights if row != 0
      //if (row1 !== 0 && col1 === 0 && p2) this.leftWeight += p2.weight;
      //if (row1 !== 0 && col1 === 1 && p2) this.rightWeight += p2.weight;
      //if (row2 !== 0 && col2 === 0 && p1) this.leftWeight += p1.weight;
      //if (row2 !== 0 && col2 === 1 && p1) this.rightWeight += p1.weight;

      // Log swap
      console.log(`Swapped positions: (${row1},${col1}) ↔ (${row2},${col2})`);
   }

   /**
    * Display the current lineup grid and total weights to the console.
    */
   showGrid() {
      console.log("Lineup Grid:");
      for (let i = 0; i < this.grid.length; i++) {
         const row = this.grid[i].map(p => (p ? p.name : "null"));
         console.log(`Row ${i}: ${row.join(" | ")}`);
      }
      console.log(`Total Left Weight: ${this.leftWeight}, Total Right Weight: ${this.rightWeight}\n`);
   }

   /**
    * Create a shallow clone of the current Lineup.
    * The grid and peopleSet are copied, so the clone is independent of the original.
    * @returns {Lineup} A new Lineup instance with the same people and weights.
    */
   clone() {
      const l = new Lineup();
      l.grid = this.grid.map(r => [...r]);
      l.leftWeight = this.leftWeight;
      l.rightWeight = this.rightWeight;
      l.peopleMap = new Map(this.peopleMap);
      return l;
   }

   /**
    * Generate a master sheet string representation of the lineup.
    * Format includes caller, row-by-row left/right names, and steer.
    * @returns {string[]} Array of strings representing the lineup for a master sheet.
    */
   mastersheetStr() {

      const rows = [];
      const firstRow = this.grid[0][0]?.name ?? "";
      rows.push(`Caller\t${firstRow}\t`);

      rows.push(`Row\tLeft\tRight`);


      for (let i = 1; i < this.grid.length; i++) {
        const left = this.grid[i][0]?.name ?? "";
        const right = this.grid[i][1]?.name ?? "";
        rows.push(`${i}\t${left}\t${right}`);
      }

      const lastRow = this.grid[0][1]?.name ?? "";
      rows.push(`Steer\t\t${lastRow}`)
      return rows;
   }
}

export { Lineup };


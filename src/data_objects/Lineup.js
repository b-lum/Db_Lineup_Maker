import { Person } from "./Person.js"; 

class Lineup {
   constructor() {
      const rows = 11
      const cols = 2
      this.peopleSet = new Set();
      this.grid = Array.from({length : rows}, () => Array(cols).fill(null));
      this.leftWeight = 0
      this.rightWeight = 0
   }

   addPerson(row, col, person) {
      // Check for null or duplicate by name
      if (person === null || this.peopleSet.has(person)) {
         console.log(`Cannot add ${person?.name || "null"}: already in lineup or invalid`);
         return; // just exit without modifying the grid
      }

      // Bounds check
      if (row < 0 || row >= this.grid.length || col < 0 || col >= this.grid[0].length) {
         throw new Error("Invalid row or column");
      }

      // Add person to grid
      this.grid[row][col] = person;
      this.peopleSet.add(person);

      // Update weights if not in first row
      if (row !== 0) {
         if (col === 0) this.leftWeight += person.weight;
         else if (col === 1) this.rightWeight += person.weight;
      }

      console.log(`Added ${person.name} to row ${row}, column ${col}`);
   }

   removePerson(row, col) {
      let p = this.grid[row][col];
      
      if (p !== null) {
         if (col === 0 && row !== 0) this.leftWeight -= p.weight;
         else if (col === 1 && row !== 0) this.rightWeight -= p.weight;

         this.grid[row][col] = null
         this.peopleSet.delete(p);
      
         console.log(`Removed ${p.name} from row ${row}, column ${col}`);
      } else {
         console.log(`No person to remove at row ${row}, column ${col}`);
      }
   }

   swapPerson(row1, col1, row2, col2) {
      // Bounds check
      if (row1 < 0 || row1 >= this.grid.length || col1 < 0 || col1 >= this.grid[0].length ||
         row2 < 0 || row2 >= this.grid.length || col2 < 0 || col2 >= this.grid[0].length) {
         throw new Error("Invalid row or column");
      }

      let p1 = this.grid[row1][col1];
      let p2 = this.grid[row2][col2];

      // Update weights: remove old weights if row != 0
      if (row1 !== 0 && col1 === 0 && p1) this.leftWeight -= p1.weight;
      if (row1 !== 0 && col1 === 1 && p1) this.rightWeight -= p1.weight;
      if (row2 !== 0 && col2 === 0 && p2) this.leftWeight -= p2.weight;
      if (row2 !== 0 && col2 === 1 && p2) this.rightWeight -= p2.weight;

      // Swap in grid
      this.grid[row1][col1] = p2;
      this.grid[row2][col2] = p1;

      // Update weights: add new weights if row != 0
      if (row1 !== 0 && col1 === 0 && p2) this.leftWeight += p2.weight;
      if (row1 !== 0 && col1 === 1 && p2) this.rightWeight += p2.weight;
      if (row2 !== 0 && col2 === 0 && p1) this.leftWeight += p1.weight;
      if (row2 !== 0 && col2 === 1 && p1) this.rightWeight += p1.weight;

      // Log swap
      console.log(`Swapped positions: (${row1},${col1}) ↔ (${row2},${col2})`);
   }

   showGrid() {
      console.log("Lineup Grid:");
      for (let i = 0; i < this.grid.length; i++) {
         const row = this.grid[i].map(p => (p ? p.name : "null"));
         console.log(`Row ${i}: ${row.join(" | ")}`);
      }
      console.log(`Total Left Weight: ${this.leftWeight}, Total Right Weight: ${this.rightWeight}\n`);
   }

   clone() {
      const l = new Lineup();
      l.grid = this.grid.map(r => [...r]);
      l.leftWeight = this.leftWeight;
      l.rightWeight = this.rightWeight;
      l.peopleSet = new Set(this.peopleSet);
      return l;
}
}

export { Lineup };


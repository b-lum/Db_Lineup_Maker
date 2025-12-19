class Person {
   constructor(name, weight, oc_400_times = [0, 0], gender = null, isSteer = false, isCaller = false) {
      this.name = name;
      this.weight = weight;
      this.oc_400_times = oc_400_times;
      this.gender = null
      this.isSteer = isSteer
      this.isCaller = isCaller
   }

   showPerson() {
      console.log(`name : ${this.name}`);
      console.log(`weight : ${this.weight}`);
   }

};

class Lineup {
   constructor() {
      const rows = 11
      const cols = 2
      this.grid = Array.from({length : rows}, () => Array(cols).fill(null));
      this.leftWeight = 0
      this.rightWeight = 0
   }

   addPerson(row, col, person) {

      if (person === null) {
         this.grid[row][col] = null;
         return;
      }
      if (row < 0 || row >= this.grid.length || col < 0 || col >= this.grid[0].length) {
         throw new Error("Invalid row or column");
      }

      this.grid[row][col] = person;
      if (col === 0 && row !== 0) this.leftWeight += person.weight;
      else if (col === 1 && row !== 0) this.rightWeight += person.weight;

      console.log(`Added ${person.name} to row ${row}, column ${col}`);
   }

   removePerson(row, col) {
      let p = this.grid[row][col];
      
      if (p !== null) {
      if (col === 0 && row !== 0) this.leftWeight -= p.weight;
      else if (col === 1 && row !== 0) this.rightWeight -= p.weight;

      this.grid[row][col] = null
      
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
}

class SortedArray {
  constructor(compareFn) {
    this.data = [];            // internal array
    this.compareFn = compareFn; // comparison function for sorting
  }

  add(item) {
    this.data.push(item);       // add new item
    this.data.sort(this.compareFn); // sort array immediately
  }

  getAll() {
    return this.data;           // read-only access to the sorted array
  }
}


export { Person, Lineup, SortedArray };

const lineup = new Lineup();
const p1 = new Person("Alice", 150, 12);
const p2 = new Person("Bob", 180, 15);

lineup.addPerson(5, 0, p1);  // left column
lineup.showGrid();

// Swap Alice with empty right column
lineup.swapPerson(5, 0, 5, 1);  
lineup.showGrid();

// Swap empty slot back
lineup.swapPerson(5, 1, 5, 0);  
lineup.showGrid();


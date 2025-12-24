import { Lineup } from "./Lineup.js"

class MixedLineup extends Lineup {
   constructor() {
      super();
      this.girlCount = 0; // max 10 girls
      this.guyCount = 0; // max 10 guys
   }

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
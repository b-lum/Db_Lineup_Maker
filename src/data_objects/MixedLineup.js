import { Lineup } from "./Lineup.js"

class MixedLineup extends Lineup {
   constructor() {
      super();
      this.girlCount = 0; // max 10 girls
      this.guyCount = 0; // max 10 guys
   }

   addPerson(row, col, person) {
      if (row === 0) super.addPerson(row, col, person);

      gender = person.gender;

      if (gender === "male") {
         if (this.guyCount === 10) {
            console.log(`Failed to add ${person.name}, boat is full with men`);
            return false;
         } else {
            super.addPerson(row, col, person);
            this.guyCount += 1;
            console.log(`Successfully added ${person.name}`);
            return true;
         }
      } else if (gender === "female") {
         if (this.girlCount === 10) {
            console.log(`Failed to add ${person.name}, boat is full with women`);
            return false;
         }else {
            super.addPerson(row, col, person);
            this.girlCount += 1;
            console.log(`Successfully added ${person.name}`);
            return true;
         }

      }

   }

   removePerson(row, col) {
      person = this.grid[row][col];

      if (person !== null && person.gender === "male") {
         this.guyCount -= 1;
      } if (person !== null && person.gender === "female") {
         this.girlCount += 1;
      }
      
      super.removePerson(row, col);
   }


}
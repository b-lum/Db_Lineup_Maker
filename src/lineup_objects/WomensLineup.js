import { Lineup } from "./Lineup";
import { Person } from "../data_objects/Person";
class WomensLineup extends Lineup {

   addPerson(row, col, person) {
      if (person?.gender == "female" || row === 0) {
         return super.addPerson(row, col, person);
      }
      
      console.log(`Failed to add ${person.name}, only women on this boat`)
      return false;
   }


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
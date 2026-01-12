class Roster {
   constructor(people = [], comparator = null) {
      this.people = [...people];
      this.comparator = comparator
   }

   withComparator(comparator) {
      const next = new Roster(this.people, comparator)
      next.sort();
      return next;
   }

   add(person) {
      const next = new Roster(this.people, this.comparator)
      next.people.push(person);
      next.sort();
       console.log(`adding ${person.name} to roster`);

      return next;
   }

   sort() {
      if (this.comparator) {
         this.people.sort(this.comparator);
      }
   }

   toArray() {
      return [...this.people]
   }
}

export { Roster };
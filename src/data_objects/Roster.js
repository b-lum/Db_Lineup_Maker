import { Person } from "./Person.js";

export class Roster {
  constructor(people = [], comparator = null) {
    this.people = [...people];
    this.comparator = comparator;
    if (comparator) this.people.sort(comparator);
  }

  addPerson(person) {
    if (!this.people.some(p => p.name === person.name)) {
      this.people.push(person);
      if (this.comparator) this.people.sort(this.comparator);
    }
    return this; // <--- important for chaining in your parser
  }

  removePerson(person) {
    this.people = this.people.filter(p => p.name !== person.name);
  }

  sortBy(prop, order = "asc") {
    this.people = sortPeople(this.people, prop, order);
    this.comparator = (a, b) => {
      const sorted = sortPeople([a, b], prop, order);
      return sorted[0] === a ? -1 : 1;
    };
  }

  getAll() {
    return [...this.people];
  }
}

// helper for sortBy
export function sortPeople(people, prop, order = "asc") {
  return [...people].sort((a, b) => {
    const aVal = a[prop] ?? a.kwargs?.[prop];
    const bVal = b[prop] ?? b.kwargs?.[prop];

    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return order === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (aStr < bStr) return order === "asc" ? -1 : 1;
    if (aStr > bStr) return order === "asc" ? 1 : -1;
    return 0;
  });
}
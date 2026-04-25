import { Lineup } from "../lineup_objects/Lineup.js";
import { MixedLineup } from "../lineup_objects/MixedLineup.js";
import { WomensLineup } from "../lineup_objects/WomensLineup.js";

/**
 * PracticeLayout — like RaceLayout but enforces that each person
 * appears in at most ONE lineup across the whole layout.
 *
 * Supports Open / Womens / Mixed lineup types per boat.
 * Supports dynamically adding and removing lineups.
 */
class PracticeLayout {

  /**
   * @param {string} boatName
   * @param {number} numLineups - initial number of lineups (default 3)
   * @param {string} boatType - "Open" | "Womens" | "Mixed"
   */
  constructor(boatName, numLineups = 3, boatType = "Open") {
    this.boatName = boatName;
    this.boatType = boatType;
    this.numHeats = numLineups; // keep same property name as RaceLayout for compatibility
    this.lineups = new Map();

    for (let i = 0; i < numLineups; i++) {
      this.lineups.set(i, this._makeLineup());
    }
  }

  /** Create the right lineup type based on boatType */
  _makeLineup() {
    if (this.boatType === "Mixed") return new MixedLineup();
    if (this.boatType === "Womens") return new WomensLineup();
    return new Lineup();
  }

  /** Add a new empty lineup at the end */
  addBoat() {
    const nextIdx = this.lineups.size === 0
      ? 0
      : Math.max(...this.lineups.keys()) + 1;
    this.lineups.set(nextIdx, this._makeLineup());
    this.numHeats = this.lineups.size;
  }

  /** Remove the lineup at the given index */
  removeBoat(idx) {
    if (!this.lineups.has(idx)) return;
    this.lineups.delete(idx);
    this.numHeats = this.lineups.size;
  }

  /** Replace or update a lineup at a specific index */
  addLineup(i, lineup) {
    this.lineups.set(i, lineup);
  }

  /**
   * Build a set of all person names currently assigned across ALL lineups.
   * Used to enforce the one-boat-per-person rule.
   */
  _allAssignedNames() {
    const names = new Set();
    for (const lineup of this.lineups.values()) {
      for (const name of lineup.peopleMap.keys()) {
        names.add(name);
      }
    }
    return names;
  }

  /**
   * Move or swap people between lineups or roster.
   * Enforces: a person cannot be added to a lineup if they're already
   * in ANY other lineup in this PracticeLayout.
   */
  movePerson({ from, to }, roster) {

    // SAME LINEUP SWAP — always allowed
    if (from.type === "heat" && to.type === "heat" && from.heatIdx === to.heatIdx) {
      this.lineups.get(from.heatIdx)?.swapPerson(from.row, from.col, to.row, to.col);
      return;
    }

    // DIFFERENT LINEUP SWAP / MOVE
    if (from.type === "heat" && to.type === "heat") {
      const fromLineup = this.lineups.get(from.heatIdx);
      const toLineup = this.lineups.get(to.heatIdx);
      if (!fromLineup || !toLineup) return;

      const fromPerson = fromLineup.grid[from.row][from.col];
      const toPerson = toLineup.grid[to.row][to.col];

      if (!fromPerson && !toPerson) return;

      // SWAP — fine because they just trade places, net assignments unchanged
      if (fromPerson && toPerson) {
        fromLineup.removePerson(from.row, from.col);
        toLineup.removePerson(to.row, to.col);
        fromLineup.addPerson(from.row, from.col, toPerson);
        toLineup.addPerson(to.row, to.col, fromPerson);
        return;
      }

      // MOVE fromPerson → toLineup (only if fromPerson not already in toLineup)
      if (fromPerson && !toPerson) {
        if (toLineup.peopleMap.has(fromPerson.name)) {
          console.warn(`${fromPerson.name} is already in this lineup`);
          return;
        }
        fromLineup.removePerson(from.row, from.col);
        toLineup.addPerson(to.row, to.col, fromPerson);
        return;
      }

      // MOVE toPerson → fromLineup
      if (!fromPerson && toPerson) {
        if (fromLineup.peopleMap.has(toPerson.name)) {
          console.warn(`${toPerson.name} is already in this lineup`);
          return;
        }
        toLineup.removePerson(to.row, to.col);
        fromLineup.addPerson(from.row, from.col, toPerson);
        return;
      }

      return;
    }

    // ROSTER → LINEUP
    if (from.type === "sorted" && to.type === "heat") {
      const person = roster.getAll()[from.row];
      if (!person) return;

      // Enforce one-boat rule: reject if person is in any other lineup
      const assigned = this._allAssignedNames();
      const toLineup = this.lineups.get(to.heatIdx);
      if (!toLineup) return;

      // Allow if already in THIS lineup (replacing their own seat)
      if (assigned.has(person.name) && !toLineup.peopleMap.has(person.name)) {
        console.warn(`${person.name} is already assigned to another boat in this practice`);
        return;
      }

      toLineup.removePerson(to.row, to.col);
      toLineup.addPerson(to.row, to.col, person);
      return;
    }

    // LINEUP → ROSTER (remove)
    if (from.type === "heat" && to.type === "sorted") {
      const lineup = this.lineups.get(from.heatIdx);
      if (!lineup) return;
      const person = lineup.grid[from.row]?.[from.col];
      if (!person) return;
      lineup.removePerson(from.row, from.col);
      return;
    }
  }

  /** Replace person at a specific lineup / row / col */
  replacePerson(heatIdx, row, col, person) {
    const lineup = this.lineups.get(heatIdx);
    if (!lineup) return;

    // Enforce one-boat rule
    if (person) {
      const assigned = this._allAssignedNames();
      if (assigned.has(person.name) && !lineup.peopleMap.has(person.name)) {
        console.warn(`${person.name} is already in another boat`);
        return;
      }
    }

    lineup.removePerson(row, col);
    if (person) lineup.addPerson(row, col, person);
  }

  /** Clone the layout */
  clone() {
    const copy = new PracticeLayout(this.boatName, 0, this.boatType);
    copy.lineups = new Map();
    for (const [idx, lineup] of this.lineups) {
      copy.lineups.set(idx, lineup.clone());
    }
    copy.numHeats = this.lineups.size;
    return copy;
  }

  /** Master sheet string */
  mastersheetStr() {
    const lineupsArr = Array.from(this.lineups.values());
    if (lineupsArr.length === 0) return "";

    let titleLine = "";
    const numRows = lineupsArr[0].mastersheetStr().length;
    const rows = new Array(numRows).fill("").map(() => "");

    for (let i = 0; i < lineupsArr.length; i++) {
      titleLine += `${this.boatType} Boat ${i + 1}\t\t\t\t`;
      const lineupRows = lineupsArr[i].mastersheetStr();
      for (let j = 0; j < lineupRows.length; j++) {
        rows[j] += lineupRows[j] + "\t\t";
      }
    }

    return titleLine + "\n" + rows.join("\n");
  }
}

export { PracticeLayout };
/**
 * Class representing a sorted array.
 * Maintains an internal array of items and ensures they are sorted
 * according to a provided comparison function whenever a new item is added.
 */
class SortedArray {
   /**
    * Create a SortedArray.
    * @param {function} compareFn - Comparison function to determine sort order. 
    *                               Should return a negative number if a < b, zero if equal, positive if a > b.
    */
   constructor(compareFn) {
      /** @type {Array} Internal array holding the items. */
      this.data = [];    
      /** @type {function} Comparison function used for sorting. */        
      this.compareFn = compareFn; 
   }

   /**
    * Add an item to the array and keep it sorted.
    * @param {*} item - The item to add.
    */
   add(item) {
      this.data.push(item);       
      this.data.sort(this.compareFn); 
   }

   /**
    * Get all items in the sorted array.
    * @returns {Array} Array of all items in sorted order.
    */
   getAll() {
      return this.data;    
   }
}

export { SortedArray };
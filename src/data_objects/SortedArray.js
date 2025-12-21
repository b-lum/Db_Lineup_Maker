class SortedArray {
   constructor(compareFn) {
      this.data = [];            
      this.compareFn = compareFn; 
   }

   add(item) {
      this.data.push(item);       
      this.data.sort(this.compareFn); 
   }

   getAll() {
      return this.data;    
   }
}

export { SortedArray };
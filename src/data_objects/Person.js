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

}

export { Person };
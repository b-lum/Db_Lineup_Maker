class Person {
   constructor(name, weight, gender, oc_400_times = [0, 0], isSteer = false, isCaller = false) {
      this.name = name;
      this.weight = weight;
      this.gender = gender;
      this.oc_400_times = oc_400_times;
      this.isSteer = isSteer;
      this.isCaller = isCaller;
   }

   showPerson() {
      console.log(`name : ${this.name}`);
      console.log(`weight : ${this.weight}`);
      console.log(`gender : ${this.gender}`);
   }

}

export { Person };
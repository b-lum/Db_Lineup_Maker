/**
 * Class representing a person in the context of a rowing team.
 */
class Person {
    /**
     * Create a new Person.
     * @param {string} name - The full name of the person.
     * @param {number} weight - The weight of the person in kilograms (or other consistent unit).
     * @param {string} gender - The gender of the person (e.g., "male", "female", "non-binary").
     * @param {Array<number>} [oc_400_times=[0, 0]] - Optional array representing the person's 400m times in seconds.
     * @param {boolean} [isSteer=false] - Indicates if the person is a steerer (responsible for steering the boat).
     * @param {boolean} [isCaller=false] - Indicates if the person is a caller (responsible for calling stroke rhythm).
     */
    constructor(name, weight, gender, oc_400_times = [0, 0], isSteer = false, isCaller = false) {
        this.name = name;
        this.weight = weight;
        this.gender = gender;
        this.oc_400_times = oc_400_times;
        this.isSteer = isSteer;
        this.isCaller = isCaller;
    }

    /**
     * Print the person's basic information to the console.
     * Outputs the name, weight, and gender of the person.
     */
    showPerson() {
        console.log(`name : ${this.name}`);
        console.log(`weight : ${this.weight}`);
        console.log(`gender : ${this.gender}`);
    }
}

export { Person };

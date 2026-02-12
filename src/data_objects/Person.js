/**
 * Class representing a person in the context of a rowing team.
 */
class Person {
    /**
     * Create a new Person.
     * @param {string} name - The full name of the person.
     * @param {number} [weight] - The weight of the person in kilograms.
     * @param {string} [gender] - The gender of the person.
     * @param {Object} [kwargs={}] - Arbitrary key-value pairs as properties.
     */
    constructor(name, weight, gender = null, kwargs = {}) {
        this.name = name;
        this.weight = weight;
        this.gender = gender;

        // Assign all other key-value pairs to the instance
        for (const [key, value] of Object.entries(kwargs)) {
            this[key] = value;
        }
    }

    /**
     * Print the person's basic information to the console.
     * Outputs the name and key-value pair info of person.
     */
    showPerson() {
        console.log(`name: ${this.name}`);
        // Optionally show all other properties
        for (const key of Object.keys(this)) {
            if (key !== "name") {
                console.log(`${key}: ${this[key]}`);
            }
        }
    }
    
    toString() {
        // Show all properties except name
        let props = Object.entries(this)
            .filter(([key]) => key !== "name")
            .map(([key, val]) => `${key}: ${val}`)
            .join("\n");
        return `name: ${this.name}\n${props}`;
    }
}

export { Person };

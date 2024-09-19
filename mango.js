const mongoose = require('mongoose');

if (process.argv.length !== 3 && process.argv.length !== 5) {
    console.log('Fullfill the credentials');
    process.exit(1);
}


const password = process.argv[2]

// Replace <password> with the actual password variable
const url = `mongodb+srv://rahul004:kJLEUBLZiUF9Eb0C@full-stack.srh2y.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);  // Corrected to 'strictQuery'
mongoose.connect(url);

const newPerson = new mongoose.Schema({
    name: String,
    number: Number 
});

const Person = mongoose.model('Person', newPerson);

// Create the new person using command line arguments
if (process.argv.length === 3){
    Person.find({}).then(result => {
        console.log("Phonebook:")
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}else if (process.argv.length === 5){
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    });
    person.save().then(result => {
        console.log(`added ${result.name} ${result.number} to phonebook`);
        mongoose.connection.close();
    });
}


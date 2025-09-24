const express = require("express");
const morgan = require("morgan");

const Person = require("./models/person");
const PORT = process.env.PORT;

const app = express();

app.use(express.static("public"));
app.use(express.json());

app.use(
    morgan(":method :url :status :response-time ms", {
        skip: (req) => req.method === "POST",
    })
);

morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
    morgan(":method :url :status :response-time ms :body", {
        skip: (req) => req.method !== "POST",
    })
);

app.get("/info", (request, response) => {
    const timestamp = Date();
    const info = `<p>Phonebook has info for ${data.persons.length} people</p><p>${timestamp}</p>`;
    response.send(info);
});

app.get("/api/persons/:id", (request, response) => {
    Person.findById(request.params.id).then((person) => {
        if (person) response.json(person);
        else response.status(404).end();
    });
});

app.get("/api/persons", (request, response) => {
    Person.find({}).then((persons) => {
        if (persons) response.json(persons);
        else response.status(404).end();
    });
});

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body) {
        return response.status(400).json({
            error: "person missing",
        });
    }
    if (!body.name || !body.number)
        return response.status(400).json({
            error: "name or number missing",
        });

    Person.find({ name: body.name }).then((person) => {
		console.log(person);
        if (person)
            response.status(400).json({
                error: "name must be unique",
            });
        else {
            const newPerson = new Person({
                name: body.name,
                number: body.number,
            });
            newPerson.save().then((savedPerson) => {
                response.json(savedPerson);
            });
        }
    });
});

app.put("/api/persons/:id", (request, response) => {
    const index = data.persons.findIndex(
        (person) => person.id === request.params.id
    );
    if (index) {
        const newPerson = request.body;
        data.persons[index] = newPerson;
    }
});

app.delete("/api/persons/:id", (request, response) => {
    const person = data.persons.find(
        (person) => person.id === request.params.id
    );
    if (person) {
        data.persons = data.persons.filter((p) => p.id !== person.id);
        response.status(204).end();
    } else response.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

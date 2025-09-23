const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

const data = require("./data");
const PORT = process.env.PORT || 3000

const app = express();

app.use(express.static("../public"));
app.use(express.json());
app.use(cors());

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
    const person = data.persons.find(
        (persons) => persons.id === request.params.id
    );
    if (person) response.json(person);
    else response.status(404).end();
});

app.get("/api/persons", (request, response) => {
    if (data.persons) response.json(data.persons);
    else response.status(404).end();
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

    if (data.persons.find((person) => person.name === body.name))
        return response.status(400).json({
            error: "name must be unique",
        });
    const id = (Math.random() * 10000).toString();
    const person = { id: id, ...body };
    data.persons = data.persons.concat(person);
    response.json(person);
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

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

let rides = [
    {
        rides: "Bike#A8",
        price: "150"
    },
    {
        rides: "Bike#B10",
        price: "170"
    },
    {
        rides: "Bike#C67",
        price: "120"
    },
    {
        rides: "Bike#D70",
        price: "90"
    }
];

app.get('/api/product', (req, res) => {
    res.json(rides);
});

app.post('/api/product', (req, res) => {
    console.log(req.body);

    rides.push(req.body);
    res.json(req.body);
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});   
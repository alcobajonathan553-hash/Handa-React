const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'supplies.json');

app.use(express.json());
app.use(cors());

const initialSupplies = [
    { id: 1, name: 'Bottled Water', category: 'Food and Water', quantity: 100, status: 'Available' },
    { id: 2, name: 'First Aid Kit', category: 'Medical', quantity: 25, status: 'Available' },
    { id: 3, name: 'Canned Goods', category: 'Food and Water', quantity: 80, status: 'Available' },
    { id: 4, name: 'Flashlight', category: 'Lighting', quantity: 10, status: 'Low Stock' },
    { id: 5, name: 'Emergency Blanket', category: 'Clothing and Shelter', quantity: 40, status: 'Available' },
    { id: 6, name: 'Battery', category: 'Lighting', quantity: 8, status: 'Low Stock' }
];

function loadSupplies() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialSupplies, null, 2));
            return [...initialSupplies];
        }

        const savedData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        return Array.isArray(savedData) ? savedData : [...initialSupplies];
    } catch (error) {
        console.error('Could not load supplies data:', error);
        return [...initialSupplies];
    }
}

let supplies = loadSupplies();

function saveSupplies() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(supplies, null, 2));
}

function getNextId() {
    return supplies.reduce((highest, supply) => Math.max(highest, Number(supply.id) || 0), 0) + 1;
}

function getStatus(quantity) {
    return quantity <= 15 ? 'Low Stock' : 'Available';
}

function validateSupply(req, res, next) {
    const { name, category, quantity } = req.body || {};

    if (
        typeof name !== 'string' ||
        !name.trim() ||
        typeof category !== 'string' ||
        !category.trim() ||
        quantity === undefined ||
        quantity === '' ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0
    ) {
        return res.status(400).json({
            message: 'Valid name, category, and non-negative whole-number quantity are required.'
        });
    }

    req.validSupply = {
        name: name.trim(),
        category: category.trim(),
        quantity: Number(quantity)
    };

    next();
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'handa-api' });
});

app.get('/api/supplies', (req, res) => {
    res.json(supplies);
});

app.post('/api/supplies', validateSupply, (req, res) => {
    const newSupply = {
        id: getNextId(),
        ...req.validSupply,
        status: getStatus(req.validSupply.quantity)
    };

    supplies.push(newSupply);
    saveSupplies();

    console.log('Supply added ->', newSupply);
    res.status(201).json(newSupply);
});

app.put('/api/supplies/:id', validateSupply, (req, res) => {
    const id = Number(req.params.id);
    const index = supplies.findIndex((supply) => Number(supply.id) === id);

    if (!Number.isInteger(id) || index === -1) {
        return res.status(404).json({ message: 'Supply not found.' });
    }

    supplies[index] = {
        id,
        ...req.validSupply,
        status: getStatus(req.validSupply.quantity)
    };

    saveSupplies();
    console.log('Supply edited ->', supplies[index]);
    res.json(supplies[index]);
});

app.delete('/api/supplies/:id', (req, res) => {
    const id = Number(req.params.id);
    const exists = supplies.some((supply) => Number(supply.id) === id);

    if (!Number.isInteger(id) || !exists) {
        return res.status(404).json({ message: 'Supply not found.' });
    }

    supplies = supplies.filter((supply) => Number(supply.id) !== id);
    saveSupplies();

    console.log('Supply deleted -> id:', id);
    res.json({ id });
});

app.listen(PORT, () => {
    console.log(`Handa API running on port ${PORT}`);
});

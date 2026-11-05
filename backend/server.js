
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

let supplies = [
    {
        id: 1,
        name: 'Bottled Water',
        category: 'Food and Water',
        quantity: 100,
        status: 'Available'
    },
    {
        id: 2,
        name: 'First Aid Kit',
        category: 'Medical',
        quantity: 25,
        status: 'Available'
    },
    {
        id: 3,
        name: 'Canned Goods',
        category: 'Food and Water',
        quantity: 80,
        status: 'Available'
    },
    {
        id: 4,
        name: 'Flashlight',
        category: 'Lighting',
        quantity: 10,
        status: 'Low Stock'
    },
    {
        id: 5,
        name: 'Emergency Blanket',
        category: 'Clothing and Shelter',
        quantity: 40,
        status: 'Available'
    },
    {
        id: 6,
        name: 'Battery',
        category: 'Lighting',
        quantity: 8,
        status: 'Low Stock'
    }
];

let nextId = 7;

function getStatus(quantity) {
    return quantity <= 15 ? 'Low Stock' : 'Available';
}

app.get('/api/supplies', (req, res) => {
    res.json(supplies);
});

app.post('/api/supplies', (req, res) => {
    const { name, category, quantity } = req.body;

    if (
        !name?.trim() ||
        !category?.trim() ||
        quantity === undefined ||
        quantity === '' ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0
    ) {
        return res.status(400).json({
            message: 'Valid name, category, and quantity are required.'
        });
    }

    const newSupply = {
        id: nextId++,
        name: name.trim(),
        category: category.trim(),
        quantity: Number(quantity),
        status: getStatus(Number(quantity))
    };

    supplies.push(newSupply);

    console.log('Supply added ->', newSupply);

    res.status(201).json(newSupply);
});

app.put('/api/supplies/:id', (req, res) => {
    const id = Number(req.params.id);

    const index = supplies.findIndex((s) => s.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: 'Supply not found.'
        });
    }

    const { name, category, quantity } = req.body;

    if (
        !name?.trim() ||
        !category?.trim() ||
        quantity === undefined ||
        quantity === '' ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0
    ) {
        return res.status(400).json({
            message: 'Valid name, category, and quantity are required.'
        });
    }

    supplies[index] = {
        id,
        name: name.trim(),
        category: category.trim(),
        quantity: Number(quantity),
        status: getStatus(Number(quantity))
    };

    console.log('Supply edited ->', supplies[index]);

    res.json(supplies[index]);
});

app.delete('/api/supplies/:id', (req, res) => {
    const id = Number(req.params.id);

    const exists = supplies.some((s) => s.id === id);

    if (!exists) {
        return res.status(404).json({
            message: 'Supply not found.'
        });
    }

    supplies = supplies.filter((s) => s.id !== id);

    console.log('Supply deleted -> id:', id);

    res.json({ id });
});

app.listen(8080, () => {
    console.log('Server running on port 8080');
});

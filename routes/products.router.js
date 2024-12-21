const express = require('express');
const router = express.Router();
const Product = require('../models/products.models');
const Category = require('../models/categories.models');

router.get('/shop', async (req, res) => {
    try {
        const products = await Product.find();
        const categories = await Category.find();
        
        res.render('pages/Main_Site_pages/products', {
            layout: false,
            products,
            categories,
            isAuthenticated: req.isAuthenticated,
            isAdmin: req.isAdmin
        });
    } catch (error) {
        console.error('Error loading shop page:', error);
        res.status(500).send('Error loading products');
    }
});

// API endpoint for filtering products
router.get('/api/products/filter', async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        let query = { stock: { $gt: 0 } };
        let sortOption = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        switch (sort) {
            case 'price-low':
                sortOption.price = 1;
                break;
            case 'price-high':
                sortOption.price = -1;
                break;
            default:
                sortOption.createdAt = -1;
        }

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error filtering products' });
    }
});

module.exports = router; 
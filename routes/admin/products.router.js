const express = require("express");
const multer = require("multer");
const router = express.Router();
const Product = require("../../models/products.models");
const Category = require("../../models/categories.models");
const { requireAdmin } = require('../../middleware/adminAuth.middleware');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Product Routes
router.get("/admin/products", requireAdmin, async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const filter = req.query.filter || 'all';
        const categoryFilter = req.query.category || '';

        let query = {};
        if (searchQuery) {
            query = {
                $or: [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { description: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }

        if (categoryFilter) {
            query.category = categoryFilter;
        }

        if (filter === 'featured') {
            query.isFeatured = true;
        } else if (filter === 'low-stock') {
            query.stock = { $lte: 10 };
        }

        const products = await Product.find(query)
            .sort(sortBy === 'price' ? { price: 1 } : { createdAt: -1 });
        const categories = await Category.find();

        res.render("pages/Admin_Pages/products", { 
            layout: "admin-layout",
            products,
            categories,
            searchQuery,
            sortBy,
            filter,
            categoryFilter,
            isAuthenticated: true
        });
    } catch (error) {
        res.status(500).send("Error loading products");
    }
});

router.get("/admin/products/create", requireAdmin, async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("pages/Admin_Pages/create", { 
            layout: "admin-layout",
            categories,
            isAuthenticated: true
        });
    } catch (error) {
        res.status(500).send("Error loading categories");
    }
});

router.post("/admin/products/create", requireAdmin, upload.single("image"), async (req, res) => {
    try {
        const newProduct = new Product({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            isFeatured: req.body.isFeatured === 'on',
            imageSrc: req.file ? 'uploads/' + req.file.filename : '',
            stock: req.body.stock || 0
        });

        await newProduct.save();
        res.redirect("/admin/products");
    } catch (error) {
        console.error('Error creating product:', error);
        const categories = await Category.find();
        res.render("pages/Admin_Pages/create", { 
            layout: "admin-layout",
            categories,
            error: error.message || "Error creating product",
            isAuthenticated: true
        });
    }
});

// Category Routes
router.get("/admin/categories", requireAdmin, async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render("pages/Admin_Pages/categories", { 
            layout: "admin-layout",
            categories,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        res.status(500).send("Error loading categories");
    }
});

router.post("/admin/categories/create", requireAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            throw new Error('Category name is required');
        }

        const newCategory = new Category({
            name: name.trim(),
            description: req.body.description || ''
        });

        await newCategory.save();
        res.redirect("/admin/categories");
    } catch (error) {
        console.error('Error creating category:', error);
        res.render("pages/Admin_Pages/categories", { 
            layout: "admin-layout",
            categories: await Category.find(),
            error: error.message || "Error creating category",
            isAuthenticated: true
        });
    }
});

// Add category edit route
router.post("/admin/categories/edit/:id", requireAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            throw new Error('Category name is required');
        }

        await Category.findByIdAndUpdate(req.params.id, {
            name: name.trim(),
            description: req.body.description || ''
        });

        res.redirect("/admin/categories");
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send("Error updating category");
    }
});

// Add category delete route
router.get("/admin/categories/delete/:id", requireAdmin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send("Error deleting category");
    }
});

// Edit product route
router.get("/admin/products/edit/:id", requireAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const categories = await Category.find();
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.render("pages/Admin_Pages/edit-product", { 
            layout: "admin-layout",
            product,
            categories,
            isAuthenticated: true
        });
    } catch (error) {
        res.status(500).send("Error loading product");
    }
});

// Update product route
router.post("/admin/products/edit/:id", requireAdmin, upload.single("image"), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Product not found");
        }

        product.title = req.body.title;
        product.description = req.body.description;
        product.price = req.body.price;
        product.category = req.body.category;
        product.stock = req.body.stock || 0;
        product.isFeatured = req.body.isFeatured === 'on';

        if (req.file) {
            product.imageSrc = 'uploads/' + req.file.filename;
        }

        await product.save();
        res.redirect("/admin/products");
    } catch (error) {
        res.status(500).send("Error updating product");
    }
});

// Delete product route
router.get("/admin/products/delete/:id", requireAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/admin/products");
    } catch (error) {
        res.status(500).send("Error deleting product");
    }
});

// API route for filtered products
router.get("/api/products/filter", requireAdmin, async (req, res) => {
    try {
        const { search, sortBy, filter, category } = req.query;
        let query = {};

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Status filter
        if (filter === 'featured') {
            query.isFeatured = true;
        } else if (filter === 'low-stock') {
            query.stock = { $lte: 10, $gt: 0 };
        } else if (filter === 'out-stock') {
            query.stock = 0;
        }

        // Sort configuration
        let sort = {};
        if (sortBy === 'price') {
            sort.price = 1;
        } else if (sortBy === '-price') {
            sort.price = -1;
        } else if (sortBy === 'stock') {
            sort.stock = 1;
        } else {
            sort.createdAt = -1;
        }

        const products = await Product.find(query).sort(sort);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error fetching products" });
    }
});

// API route for updating stock
router.post("/api/products/:id/stock", requireAdmin, async (req, res) => {
    try {
        const { stock } = req.body;
        await Product.findByIdAndUpdate(req.params.id, { stock });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error updating stock" });
    }
});

module.exports = router;

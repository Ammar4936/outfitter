const express = require("express");
const multer = require("multer");
let router = express.Router();
const Admin = require("../../models/admin.models");
const Product = require("../../models/products.models");
const Category = require("../../models/categories.models");

// Authentication middleware
const authenticateAdmin = async (req, res, next) => {
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }
    next();
};

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify upload folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});
const upload = multer({ storage });

// Login/Register routes
router.get("/admin/register", (req, res) => {
    res.render("pages/Admin_Pages/register", { layout: false });
});

router.post("/admin/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = new Admin({ username, password });
        await admin.save();
        res.redirect("/admin/login");
    } catch (error) {
        res.render("pages/Admin_Pages/register", { 
            layout: false,
            error: "Registration failed. Username might be taken."
        });
    }
});

router.get("/admin/login", (req, res) => {
    res.render("pages/Admin_Pages/login", { layout: false });
});

router.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        
        if (!admin || !(await admin.comparePassword(password))) {
            return res.render("pages/Admin_Pages/login", { 
                layout: false,
                error: "Invalid username or password"
            });
        }

        req.session.adminId = admin._id;
        res.redirect("/admin/dashboard");
    } catch (error) {
        res.render("pages/Admin_Pages/login", { 
            layout: false,
            error: "Login failed"
        });
    }
});

router.get("/admin/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/admin/login");
});

// Product Routes
router.get("/admin/products", authenticateAdmin, async (req, res) => {
    try {
        let products = await Product.find();
        res.render("pages/Admin_Pages/products", { layout: "admin-layout.ejs", products });
    } catch (error) {
        res.status(500).send("Error loading products");
    }
});

router.get("/admin/products/create", authenticateAdmin, (req, res) => {
    res.render("pages/Admin_Pages/create", { layout: "admin-layout.ejs" });
});

router.post("/admin/products/create", authenticateAdmin, upload.single("imageSrc"), async (req, res) => {
    try {
        let newProduct = new Product({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            isFeatured: Boolean(req.body.isFeatured),
            imageSrc: req.file ? req.file.path : null // Handle uploaded image path
        });
        await newProduct.save();
        return res.redirect("/admin/products");
    } catch (error) {
        res.status(500).send("Error creating product");
    }
});

router.get("/admin/products/delete/:id", authenticateAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/admin/products");
    } catch (error) {
        res.status(500).send("Error deleting product");
    }
});

router.get("/admin/products/edit/:id", authenticateAdmin, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.render("pages/Admin_Pages/edit-form", { layout: "admin-layout.ejs", product });
    } catch (error) {
        res.status(500).send("Error loading product");
    }
});

router.post("/admin/products/edit/:id", authenticateAdmin, upload.single("imageSrc"), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        product.title = req.body.title;
        product.description = req.body.description;
        product.price = req.body.price;
        product.category = req.body.category;
        product.isFeatured = Boolean(req.body.isFeatured);

        // Update image if a new one is uploaded
        if (req.file) {
            product.imageSrc = req.file.path;
        }

        await product.save();
        res.redirect("/admin/products");
    } catch (error) {
        res.status(500).send("Error updating product");
    }
});

// Dashboard route
router.get("/admin/dashboard", authenticateAdmin, (req, res) => {
    res.render("pages/Admin_Pages/dashboard", { layout: "admin-layout.ejs" });
});

// Category Routes
router.get("/admin/categories", authenticateAdmin, async (req, res) => {
    try {
        let categories = await Category.find();
        res.render("pages/Admin_Pages/category", { layout: "admin-layout.ejs", categories });
    } catch (error) {
        res.status(500).send("Error loading categories");
    }
});

router.get("/admin/categories/createCategory", (req, res) => {
    res.render("pages/Admin_Pages/createCategory", { layout: "admin-layout.ejs" });
});

router.post("/admin/categories/create", authenticateAdmin, async (req, res) => {
    try {
        let newCategory = new Category({
            category: req.body.category
        });
        await newCategory.save();
        return res.redirect("/admin/categories");
    } catch (error) {
        res.status(500).send("Error creating category");
    }
});

router.get("/admin/categories/delete/:id", authenticateAdmin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect("/admin/categories");
    } catch (error) {
        res.status(500).send("Error deleting category");
    }
});

router.get("/admin/categories/edit/:id", authenticateAdmin, async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send("Category not found");
        }
        res.render("pages/Admin_Pages/Edit-category", { layout: "admin-layout.ejs", category });
    } catch (error) {
        res.status(500).send("Error loading category");
    }
});

router.post("/admin/categories/edit/:id", authenticateAdmin, async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send("Category not found");
        }
        category.category = req.body.category;
        await category.save();
        res.redirect("/admin/categories");
    } catch (error) {
        res.status(500).send("Error updating category");
    }
});

module.exports = router;

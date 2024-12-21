const express = require('express');
const router = express.Router();
const Product = require('../../models/products.models');
const Category = require('../../models/categories.models');

router.get('/admin/dashboard', requireAdmin, async (req, res) => {
    try {
        // Get total products
        const totalProducts = await Product.countDocuments();
        
        // Get total categories
        const totalCategories = await Category.countDocuments();
        
        // Get featured products count
        const featuredProducts = await Product.countDocuments({ isFeatured: true });
        
        // Get low stock products count
        const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });
        
        // Get out of stock products count
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        
        // Get recent products
        const recentProducts = await Product.find()
            .sort({ createdAt: -1 })
            .limit(5);
        
        // Get products by category
        const productsByCategory = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.render('pages/Admin_Pages/dashboard', {
            layout: 'admin-layout',
            stats: {
                totalProducts,
                totalCategories,
                featuredProducts,
                lowStockProducts,
                outOfStockProducts
            },
            recentProducts,
            productsByCategory,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

module.exports = router; 
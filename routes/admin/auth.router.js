const express = require('express');
const router = express.Router();
const Admin = require('../../models/admin.models');
const { createToken, setTokenCookie } = require('../../middleware/auth.middleware');
const { isAdmin } = require('../../middleware/adminAuth.middleware');

// Show admin login page
router.get('/admin/login', isAdmin, (req, res) => {
    // If already logged in as admin, redirect to dashboard
    if (res.locals.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('pages/Admin_Pages/login', { layout: false });
});

// Show admin registration page
router.get('/admin/register', (req, res) => {
    res.render('pages/Admin_Pages/register', { layout: false });
});

// Handle admin registration
router.post('/admin/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = new Admin({ username, password });
        await admin.save();
        
        const token = createToken(admin._id);
        setTokenCookie(res, token);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('pages/Admin_Pages/register', { 
            layout: false,
            error: "Registration failed. Username might be taken."
        });
    }
});

// Handle admin login
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        
        if (!admin || !(await admin.comparePassword(password))) {
            return res.render('pages/Admin_Pages/login', { 
                layout: false,
                error: "Invalid username or password"
            });
        }

        const token = createToken(admin._id);
        setTokenCookie(res, token);
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.render('pages/Admin_Pages/login', { 
            layout: false,
            error: "Login failed"
        });
    }
});

// Admin logout
router.get('/admin/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
});

// Protected admin routes
router.get('/admin/dashboard', isAdmin, (req, res) => {
    res.render('pages/Admin_Pages/dashboard', { 
        layout: 'admin-layout',
        isAuthenticated: true
    });
});

module.exports = router; 
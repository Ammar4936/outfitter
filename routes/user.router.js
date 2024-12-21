const express = require('express');
const router = express.Router();
const User = require('../models/user.models');
const { createToken, setTokenCookie } = require('../middleware/auth.middleware');

// Show login page
router.get('/login', (req, res) => {
    res.render('pages/User_Pages/login', { layout: false });
});

// Show signup page
router.get('/signup', (req, res) => {
    res.render('pages/User_Pages/signup', { layout: false });
});

// Handle signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();
        const token = createToken(user._id);
        setTokenCookie(res, token);
        res.redirect('/');
    } catch (error) {
        res.render('pages/User_Pages/signup', { 
            layout: false,
            error: "Registration failed. Username or email might be taken."
        });
    }
});

// Handle login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.comparePassword(password))) {
            return res.render('pages/User_Pages/login', { 
                layout: false,
                error: "Invalid email or password"
            });
        }
        const token = createToken(user._id);
        setTokenCookie(res, token);
        res.redirect('/');
    } catch (error) {
        res.render('pages/User_Pages/login', { 
            layout: false,
            error: "Login failed"
        });
    }
});

// Handle logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router; 
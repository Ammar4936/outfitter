const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.models');
const JWT_SECRET = '223e8552ee65bc3611f5c0d25b27271899c8855186b8f3e81c6381e838e87a75';

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.locals.isAdmin = false;
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.userId);
        
        if (admin) {
            req.admin = admin;
            res.locals.isAdmin = true;
        } else {
            res.locals.isAdmin = false;
        }
        next();
    } catch (error) {
        res.locals.isAdmin = false;
        next();
    }
};

// Middleware to require admin authentication
const requireAdmin = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/admin/login');
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.userId);
        
        if (!admin) {
            return res.redirect('/admin/login');
        }
        
        req.admin = admin;
        res.locals.isAdmin = true;
        next();
    } catch (error) {
        res.redirect('/admin/login');
    }
};

module.exports = { isAdmin, requireAdmin }; 
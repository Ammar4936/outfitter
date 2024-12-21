const jwt = require('jsonwebtoken');

const JWT_SECRET = '223e8552ee65bc3611f5c0d25b27271899c8855186b8f3e81c6381e838e87a75';

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.locals.isAuthenticated = false;
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        res.locals.isAuthenticated = true;
        next();
    } catch (error) {
        res.locals.isAuthenticated = false;
        res.clearCookie('token');
        next();
    }
};

// Middleware to require authentication (redirect to login if not authenticated)
const requireAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};

// Helper function to create JWT token
const createToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { 
        expiresIn: '7d' 
    });
};

// Helper function to set token cookie
const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'Lax'
    });
};

module.exports = {
    isAuthenticated,
    requireAuth,
    createToken,
    setTokenCookie
}; 
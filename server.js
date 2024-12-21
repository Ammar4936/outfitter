const express = require("express");
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middleware/auth.middleware');
const { isAdmin } = require('./middleware/adminAuth.middleware');
let app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS Layout configuration
var expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layout"); // Set default layout
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Session configuration
const session = require('express-session');
app.use(session({
    secret: 'authentication',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Apply authentication middleware
app.use(isAuthenticated);
app.use(isAdmin);

// Routes
let userRouter = require("./routes/user.router");
let adminRouter = require("./routes/admin/auth.router");
let productsRouter = require("./routes/admin/products.router");
let shopRouter = require("./routes/products.router");
app.use(userRouter);
app.use(adminRouter);
app.use(productsRouter);
app.use(shopRouter);

// MongoDB connection
const mongoose = require("mongoose");
let connectionstring = "mongodb://127.0.0.1:27017/Outfitters"
mongoose.connect(connectionstring)
.then(() => {
    console.log(`Connected to ${connectionstring}`)
})
.catch(() => {
    console.log("error")
});

// Landing page route
app.get("/", (req, res) => {
    res.render("pages/Main_Site_pages/landingPage", { 
        layout: false,
        isAuthenticated: res.locals.isAuthenticated,
        isAdmin: res.locals.isAdmin
    });
});

app.listen(5004, () => {
    console.log("Server started at location : 5004");
});
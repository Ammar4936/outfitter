const express = require("express");
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middleware/auth.middleware');
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

// Session configuration
const session = require('express-session');
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Apply authentication middleware
app.use(isAuthenticated);

// Routes
let productsRouter = require("./routes/admin/products.router");
let userRouter = require("./routes/user.router");
app.use(userRouter);
app.use(productsRouter);

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
        isAuthenticated: res.locals.isAuthenticated 
    });
});

app.listen(5004, () => {
    console.log("Server started at location : 5004");
});
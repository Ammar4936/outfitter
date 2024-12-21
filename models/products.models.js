const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Product title is required'],
        trim: true
    },
    description: { 
        type: String, 
        required: [true, 'Product description is required']
    },
    price: { 
        type: Number, 
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: { 
        type: String, 
        required: [true, 'Product category is required'],
        ref: 'Category'
    },
    isFeatured: { 
        type: Boolean, 
        default: false 
    },
    imageSrc: { 
        type: String, 
        required: [true, 'Product image is required']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Product', productSchema);

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmturvw6y',
    api_key: process.env.CLOUDINARY_API_KEY || '722777372843854',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'ZQG-IDcV3PkE5VyE30rdY_W09dY',
});
module.exports = cloudinary;
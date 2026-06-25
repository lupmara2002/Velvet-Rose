const connectToDatabase = require('../db');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const withCors = require('../withCors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const JWT_SECRET = process.env.JWT_SECRET;

const multipart = require('lambda-multipart-parser');

const handler = async (event, context) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader && ['PUT', 'POST', 'DELETE'].includes(event.httpMethod)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Missing Authorization header' }),
    };
  }

  if (['PUT', 'POST', 'DELETE'].includes(event.httpMethod)) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded.admin && event.httpMethod !== 'GET') {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Forbidden: Admins only' }),
        };
      }
    } catch (err) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database connection error' }),
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        let filters = event.queryStringParameters || {};
        Object.keys(filters).forEach(key => {
          if (filters[key] === '' || filters[key] == null) delete filters[key];
        });
        const page = parseInt(filters.page, 10) || 1;
        const limit = parseInt(filters.limit, 10) || 30;
        const skip = (page - 1) * limit;
        delete filters.page;
        delete filters.limit;
        if (filters.id) { filters._id = filters.id; delete filters.id; }
        if (filters.minPrice || filters.maxPrice) {
          const priceFilter = {};
          if (filters.minPrice) priceFilter.$gte = parseFloat(filters.minPrice);
          if (filters.maxPrice) priceFilter.$lte = parseFloat(filters.maxPrice);
          filters.price = priceFilter;
          delete filters.minPrice;
          delete filters.maxPrice;
        }
        ['brand','category'].forEach(field => {
          if (filters[field] && filters[field].includes(',')) {
            filters[field] = { $in: filters[field].split(',').map(v=>v.trim()) };
          }
        });

        if (filters.search) {
          filters.name = { $regex: filters.search, $options: 'i' };
          delete filters.search;
        }

        let sortObj = {};
        if (filters.sort === 'priceAsc') {
          sortObj.price = 1;
        } else if (filters.sort === 'priceDesc') {
          sortObj.price = -1;
        }
        delete filters.sort;

        const query = Product.find(filters)
          .skip(skip)
          .limit(limit)
          .sort(sortObj);
        const products = await query;
        const totalCount = await Product.countDocuments(filters);
        return {
          statusCode: 200,
          body: JSON.stringify({ products, totalCount, page, limit }),
        };
      }

      case 'POST': {
        const result = await multipart.parse(event);

        if (!result.files || result.files.length === 0) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'No files uploaded' }),
          };
        }
        if (result.files.length > 5) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Maximum 5 images allowed' }),
          };
        }
        const imageUrls = [];
        for (const file of result.files) {
          const fileBase64 = file.content.toString('base64');
          const dataUri = `data:${file.contentType};base64,${fileBase64}`;
          const uploadResult = await cloudinary.uploader.upload(dataUri);
          imageUrls.push(uploadResult.secure_url);
        }
        const { name, price, description, category, brand, stock } = result;
        const newProduct = new Product({
          name,
          price,
          description,
          category,
          brand,
          images: imageUrls,
          stock: stock != null ? parseInt(stock, 10) : 0,
        });
        await newProduct.save();
        return {
          statusCode: 201,
          body: JSON.stringify({ product: newProduct }),
        };
      }

      case 'PUT': {
        const result = await multipart.parse(event);

        const { id, name, price, description, existingImages, category, brand, stock } = result;
        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Product ID is required' }),
          };
        }

        let existingImagesArray = [];
        if (existingImages) {
          try {
            existingImagesArray = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
          } catch (err) {
            existingImagesArray = [];
          }
        }

        const newImageUrls = [];
        if (result.files && result.files.length > 0) {
          if (existingImagesArray.length + result.files.length > 5) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Maximum 5 images allowed' }),
            };
          }
          for (const file of result.files) {
            const fileBase64 = file.content.toString('base64');
            const dataUri = `data:${file.contentType};base64,${fileBase64}`;
            const uploadResult = await cloudinary.uploader.upload(dataUri);
            newImageUrls.push(uploadResult.secure_url);
          }
        }

        const mergedImages = [...existingImagesArray, ...newImageUrls];

        const updateData = {
          name,
          price,
          description,
          category,
          brand,
          images: mergedImages
        };
        if (stock != null) updateData.stock = parseInt(stock, 10);

        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Product not found' }),
          };
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ product: updatedProduct }),
        };
      }

      case 'DELETE': {
        const id = event.queryStringParameters && event.queryStringParameters.id;
        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Product ID is required' }),
          };
        }
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Product not found' }),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Product deleted successfully' }),
        };
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Products CRUD error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

exports.handler = withCors(handler);

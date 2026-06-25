const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();


const baseUrl = process.env.BASE_URL || 'http://localhost:8888/.netlify/functions';
const token = process.env.TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImFkbWluIjp0cnVlLCJ1c2VySWQiOiJhZG1pbklkIiwiaWF0IjoxNzQxMzU5NDIyLCJleHAiOjE3NDEzNjMwMjJ9.S66BmQtloPfB2eEeEyWJErvytwmeevbBbLBzAWqP9i8';
const testDataFolder = path.join(__dirname, 'test-data');

const createProductName = (filename) => {
    const name = path.basename(filename, path.extname(filename));
    return name.replace(/[_-]/g, ' ').replace(/^\w/, c => c.toUpperCase());
};

const createProductData = (filename) => {
    const name = createProductName(filename);
    const price = (Math.random() * 50 + 10).toFixed(2); 
    const category = 'Cosmetics';
    const brand = 'TestBrand';
    const description = `This is the ${name} product.`;
    const stock = Math.random() < 0.1 ? 0 : Math.floor(Math.random() * 50) + 1;
    return { name, price, category, brand, description, stock };
};

const seedProducts = async () => {
    try {
        const files = fs.readdirSync(testDataFolder).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        });

        for (const file of files) {
            const filePath = path.join(testDataFolder, file);
            const productData = createProductData(file);

            const formData = new FormData();
            formData.append('name', productData.name);
            formData.append('price', productData.price);
            formData.append('description', productData.description);
            formData.append('category', productData.category);
            formData.append('brand', productData.brand);
            formData.append('stock', productData.stock);
            formData.append('images', fs.createReadStream(filePath));

            const response = await axios.post(`${baseUrl}/products`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...formData.getHeaders(),
                }
            });

        }

        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
};

seedProducts();

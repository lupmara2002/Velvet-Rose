const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:8888/.netlify/functions';
const TOKEN = process.env.TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImFkbWluIjp0cnVlLCJ1c2VySWQiOiJhZG1pbklkIiwiaWF0IjoxNzQxODc3NDg5LCJleHAiOjE3NDE4ODEwODl9.AavZcHj_8uUXuaazxB4grLn9Jaq-ESbMWTZbBRqqlXE';

async function scrapeProducts() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );
    await page.goto('https://www.sephora.ro/shop/baie-corp/c304/', { waitUntil: 'networkidle2' });

    try {
        await page.waitForSelector('.see-more-button', { timeout: 5000 });
        await page.evaluate(() => {
            const btn = document.querySelector('.see-more-button');
            if (btn) {
                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));

        const initialCount = await page.$$eval('.product-tile', els => els.length);

        await page.click('.see-more-button');

    } catch (err) {
        console.error('Error clicking the "see-more-button":', err);
    }

    const html = await page.content();
    await browser.close();
    return html;
}
async function downloadImageBuffer(url) {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br, zstd'
                }
            });
            return Buffer.from(response.data, 'binary');
        } catch (error) {
            if (error.code === 'ECONNRESET') {
                attempt++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Failed to download image from ${url} after ${maxRetries} attempts`);
}


function sanitizeProductName(name) {
    return name.replace(/[\s_-]+/g, ' ').trim();
}

async function seedProducts() {
    try {
        const html = await scrapeProducts();
        const $ = cheerio.load(html);
        const products = [];

        $('.product-tile').each((i, elem) => {
            const dataTcProduct = $(elem).attr('data-tcproduct');
            let productData = {};
            if (dataTcProduct) {
                try {
                    productData = JSON.parse(dataTcProduct.replace(/&quot;/g, '"'));
                } catch (err) {
                    console.error('Error parsing product data:', err);
                }
            }

            const name = productData.product_pid_name || $(elem).find('.product-title').text().trim();
            const price = productData.product_price_tf || $(elem).find('.price-sales-standard').text().trim().replace(/[^\d.]/g, '');
            const brand = productData.product_trademark || $(elem).find('.product-brand').text().trim();
            const imageUrl = $(elem).find('.product-first-img').attr('src');

            if (name) {
                products.push({
                    name: sanitizeProductName(name),
                    price: price || (Math.random() * 50 + 10).toFixed(2),
                    brand: brand || 'ScrapedBrand',
                    category: 'body care', 
                    description: `This is the ${name} product.`,
                    imageUrl
                });
            }
        });

        const productsToSeed = products.slice(0, 100); 


        for (const prod of productsToSeed) {
            const imageBuffer = await downloadImageBuffer(prod.imageUrl);
            if (!imageBuffer) {
                continue;
            }

            const formData = new FormData();
            formData.append('name', prod.name);
            formData.append('price', prod.price);
            formData.append('description', prod.description);
            formData.append('category', prod.category);
            formData.append('brand', prod.brand);
            formData.append('stock', Math.random() < 0.1 ? 0 : Math.floor(Math.random() * 50) + 1);
            formData.append('images', imageBuffer, { filename: `${prod.name.replace(/\s+/g, '_').toLowerCase()}.jpg`, contentType: 'image/jpeg' });

            try {
                const response = await axios.post(`${BASE_URL}/products`, formData, {
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                        ...formData.getHeaders(),
                    }
                });
            } catch (error) {
                console.error(`Error creating product ${prod.name}:`, error.response ? error.response.data : error.message);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();

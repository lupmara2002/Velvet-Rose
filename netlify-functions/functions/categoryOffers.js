// netlify-functions/functions/categoryOffers.js
const connectToDatabase = require('../db');
const CategoryOffer = require('../models/CategoryOffer');
const jwt = require('jsonwebtoken');
const withCors = require('../withCors');

const JWT_SECRET = process.env.JWT_SECRET;

const verifyAdmin = (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) return null;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded.admin ? decoded : null;
  } catch {
    return null;
  }
};

const handler = async (event) => {
  await connectToDatabase();

  switch (event.httpMethod) {
    // Public → only active offers; admin → all offers
    case 'GET': {
      const isAdmin = !!verifyAdmin(event);
      const query = isAdmin ? {} : { active: true };
      const offers = await CategoryOffer.find(query).sort({ category: 1 });
      return { statusCode: 200, body: JSON.stringify(offers) };
    }

    // Admin — create a new offer
    case 'POST': {
      if (!verifyAdmin(event)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
      }
      const { category, buyQty, freeQty = 1 } = JSON.parse(event.body);
      if (!category || !buyQty) {
        return { statusCode: 400, body: JSON.stringify({ error: 'category and buyQty are required.' }) };
      }
      const offer = await CategoryOffer.findOneAndUpdate(
        { category },
        { category, buyQty: Number(buyQty), freeQty: Number(freeQty), active: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return { statusCode: 200, body: JSON.stringify(offer) };
    }

    // Admin — toggle active or update quantities
    case 'PUT': {
      if (!verifyAdmin(event)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
      }
      const { id, buyQty, freeQty, active } = JSON.parse(event.body);
      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'id is required.' }) };
      }
      const update = {};
      if (buyQty !== undefined) update.buyQty = Number(buyQty);
      if (freeQty !== undefined) update.freeQty = Number(freeQty);
      if (active !== undefined) update.active = Boolean(active);
      const updated = await CategoryOffer.findByIdAndUpdate(id, update, { new: true });
      if (!updated) return { statusCode: 404, body: JSON.stringify({ error: 'Offer not found.' }) };
      return { statusCode: 200, body: JSON.stringify(updated) };
    }

    // Admin — delete an offer
    case 'DELETE': {
      if (!verifyAdmin(event)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden' }) };
      }
      const { id } = event.queryStringParameters || {};
      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: 'id query param required.' }) };
      }
      await CategoryOffer.findByIdAndDelete(id);
      return { statusCode: 200, body: JSON.stringify({ message: 'Deleted.' }) };
    }

    default:
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
};

exports.handler = withCors(handler);

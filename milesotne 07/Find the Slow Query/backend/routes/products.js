const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// Product Listing by Category
router.get('/', async (req, res) => {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ success: false, message: 'Category is required' });
  }

  try {
    const products = await prisma.product.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// User Activity Log
router.get('/:id/activity', async (req, res) => {
  const { id } = req.params;

  try {
    const activities = await prisma.activity.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        userId: true,
        type: true,
        data: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: Get team members
 *     tags: [Team]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Team members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   position:
 *                     type: string
 *                   image:
 *                     type: string
 *                   bio:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 */
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    
    // Mock team data for now
    const teamMembers = [
      {
        _id: '1',
        name: 'أحمد محمد',
        position: 'مدير التصميم',
        image: '/team/ahmed.jpg',
        bio: 'خبير في التصميم الجرافيكي والهوية البصرية',
        isActive: true
      },
      {
        _id: '2', 
        name: 'فاطمة علي',
        position: 'مصممة UI/UX',
        image: '/team/fatima.jpg',
        bio: 'متخصصة في تصميم واجهات المستخدم',
        isActive: true
      },
      {
        _id: '3',
        name: 'محمد سالم',
        position: 'مطور ويب',
        image: '/team/mohamed.jpg', 
        bio: 'مطور مواقع ويب متقدم',
        isActive: false
      }
    ];
    
    let filteredMembers = teamMembers;
    
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredMembers = teamMembers.filter(member => member.isActive === activeFilter);
    }
    
    res.json(filteredMembers);
  } catch (error) {
    console.error('Team API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve team members'
    });
  }
});

export default router;

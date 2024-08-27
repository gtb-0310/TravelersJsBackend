const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interest.controller');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * @swagger
 * tags:
 *   name: Interests
 *   description: API for managing and retrieving user interests
 */

/**
 * @swagger
 * /interests:
 *   get:
 *     summary: Retrieve all interests
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all interests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the interest
 *                   name:
 *                     type: string
 *                     description: The name of the interest
 *       404:
 *         description: No interests found
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, interestController.getAllInterest);

/**
 * @swagger
 * /interests/{interestIds}:
 *   get:
 *     summary: Retrieve interests by their IDs
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interestIds
 *         required: true
 *         schema:
 *           type: string
 *         description: A comma-separated list of interest IDs
 *     responses:
 *       200:
 *         description: Successfully retrieved the specified interests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the interest
 *                   name:
 *                     type: string
 *                     description: The name of the interest
 *       404:
 *         description: No interests found for the provided IDs
 *       500:
 *         description: Server error
 */
router.get('/:interestIds', authenticateToken, interestController.getInterestsByIds);

module.exports = router;

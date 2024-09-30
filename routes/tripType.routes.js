const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const tripTypeController = require('../controllers/tripTypes.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages'); 

/**
 * @swagger
 * tags:
 *   name: TripTypes
 *   description: Routes for managing trip types
 */

/**
 * @swagger
 * /tripTypes:
 *   get:
 *     summary: Retrieve a list of all trip types
 *     description: Fetch all available trip types from the database.
 *     tags: [TripTypes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all trip types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The trip type ID.
 *                     example: 60d21b4667d0d8992e610c85
 *                   name:
 *                     type: string
 *                     description: The name of the trip type.
 *                     example: "Adventure"
 *       404:
 *         description: No trip types found.
 *       500:
 *         description: Internal server error.
 */
router.get('/', authenticateToken, tripTypeController.getAllTripTypes);

/**
 * @swagger
 * /tripTypes/{id}:
 *   get:
 *     summary: Retrieve a specific trip type by ID
 *     description: Fetch a specific trip type by providing its ID.
 *     tags: [TripTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the trip type.
 *     responses:
 *       200:
 *         description: The details of the requested trip type.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The trip type ID.
 *                 name:
 *                   type: string
 *                   description: The name of the trip type.
 *       404:
 *         description: Trip type not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
    '/:id',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('id').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_TRIP_TYPE_ID)
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    tripTypeController.getTripTypeById
);

module.exports = router;
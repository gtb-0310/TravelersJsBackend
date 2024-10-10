const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const transportController = require('../controllers/transport.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');
const mongoose = require('mongoose'); 

/**
 * @swagger
 * tags:
 *   name: Transports
 *   description: Routes for the means of transports
 */

/**
 * @swagger
 * /transports:
 *   get:
 *     summary: Retrieve a list of all means of transport
 *     description: Fetch all available means of transport from the database.
 *     tags: [Transports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all transports.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The transport ID.
 *                     example: 60d21b4667d0d8992e610c85
 *                   type:
 *                     type: string
 *                     description: The type of transport.
 *                     example: "Bus"
 *       404:
 *         description: No transports found.
 *       500:
 *         description: Internal server error.
 */
router.get('/', authenticateToken, transportController.getAllTransports);

/**
 * @swagger
 * /transports/{id}:
 *   get:
 *     summary: Retrieve specific means of transport by ID(s)
 *     description: Fetch one or multiple means of transport by providing their ID(s). Multiple IDs can be provided as a comma-separated string.
 *     tags: [Transports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID or IDs of the transport(s), comma-separated for multiple.
 *     responses:
 *       200:
 *         description: A list of transports matching the provided IDs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The transport ID.
 *                   type:
 *                     type: string
 *                     description: The type of transport.
 *       404:
 *         description: No transports found for the given ID(s).
 *       500:
 *         description: Internal server error.
 */
router.get(
    '/:transportsIds',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('transportsIds')
            .custom((value, { req }) => {
                const ids = value.split(',');
                for (let id of ids) {
                    if (!mongoose.Types.ObjectId.isValid(id)) {
                        throw new Error(req.validationMessages.INVALID_TRANSPORT_ID);
                    }
                }
                return true;
            })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    transportController.getTransportsById
);

module.exports = router;


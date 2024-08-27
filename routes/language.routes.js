const express = require('express');
const router = express.Router();
const languageController = require('../controllers/language.controller');
const authenticateToken = require('../middlewares/authenticateToken');

/**
 * @swagger
 * tags:
 *   name: Languages
 *   description: API for managing and retrieving languages
 */

/**
 * @swagger
 * /languages:
 *   get:
 *     summary: Retrieve all languages
 *     tags: [Languages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all languages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the language
 *                   name:
 *                     type: string
 *                     description: The name of the language
 *       404:
 *         description: No languages found
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, languageController.getAllLanguages);

/**
 * @swagger
 * /languages/{languageIds}:
 *   get:
 *     summary: Retrieve languages by their IDs
 *     tags: [Languages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: languageIds
 *         required: true
 *         schema:
 *           type: string
 *         description: A comma-separated list of language IDs
 *     responses:
 *       200:
 *         description: Successfully retrieved the specified languages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The ID of the language
 *                   name:
 *                     type: string
 *                     description: The name of the language
 *       404:
 *         description: No languages found for the provided IDs
 *       500:
 *         description: Server error
 */
router.get('/:languageIds', authenticateToken, languageController.getLanguagesByIds);

module.exports = router;

const express = require('express'),
    router = express.Router(),
    countryController = require('../controllers/country.controller'),
    authenticateToken = require('../middlewares/authenticateToken');

/**
 * @swagger
 * tags:
 *   name: Countries
 */

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Récupère la liste de tous les pays
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des pays
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID du pays
 *                   name:
 *                     type: string
 *                     description: Nom du pays
 */
router.get('/', authenticateToken, countryController.getAllCountries);

/**
 * @swagger
 * /countries/by-ids:
 *   get:
 *     summary: Récupère les pays par leurs IDs
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *         required: true
 *         description: IDs des pays à récupérer, séparés par des virgules
 *     responses:
 *       200:
 *         description: Liste des pays
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID du pays
 *                   name:
 *                     type: string
 *                     description: Nom du pays
 */
router.get('/by-ids', authenticateToken, countryController.getCountriesByIds);

module.exports = router;

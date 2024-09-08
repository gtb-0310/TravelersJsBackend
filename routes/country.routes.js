const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const countryController = require('../controllers/country.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');

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
router.get('/by-ids',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    check('ids')
        .custom((value, { req }) => {
            const idsArray = value.split(',');
            if (idsArray.length === 0) {
                throw new Error(req.validationMessages.SELECT_A_COUNTRY);
            }

            idsArray.forEach(id => {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new Error(req.validationMessages.INVALID_COUNTRY_ID);
                }
            });
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    countryController.getCountriesByIds
);

module.exports = router;

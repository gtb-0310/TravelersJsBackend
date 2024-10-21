const reasonReportingController = require('../controllers/reasonReporting.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const { check, validationResult } = require('express-validator');
const messages = require('../utils/messages');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reasons Reporting
 *   description: Routes for managing reasons reporting
 */

/**
 * @swagger
 * /reasons-reporting:
 *   get:
 *     summary: Retrieve all reasons for reporting
 *     tags: [Reasons Reporting]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all reasons for reporting, localized by language
 *       500:
 *         description: Server error
 */
router.get(
    '/',
    authenticateToken,
    reasonReportingController.getAllReasons)

/**
 * @swagger
 * /reasons-reporting/{reasonId}:
 *   get:
 *     summary: Retrieve a specific reason by ID
 *     tags: [Reasons Reporting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reasonId
 *         required: true
 *         description: The ID of the reason
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested reason, localized by language
 *       404:
 *         description: Reason not found
 *       500:
 *         description: Server error
 */
router.get(
    '/:reasonId',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('reasonId').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_REASON_ID)
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    reasonReportingController.getReasonById
);

module.exports = router;
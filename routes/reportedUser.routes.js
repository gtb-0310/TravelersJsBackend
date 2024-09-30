const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const reportedUserController = require('../controllers/reportedUser.controller');
const checkDatabaseAdministrator = require('../middlewares/checkDatabaseAdministrator');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');

/**
 * @swagger
 * tags:
 *   name: Reported Users
 *   description: Routes for reported users management
 */

/**
 * @swagger
 * /reported-users:
 *   get:
 *     summary: Retrieve all reports
 *     tags: [Reported Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all reports
 *       404:
 *         description: No reports found
 *       500:
 *         description: Server error
 */
router.get(
    '/',
    authenticateToken,
    checkDatabaseAdministrator,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    reportedUserController.getAllReports
);

/**
 * @swagger
 * /reported-users/{reportingId}:
 *   get:
 *     summary: Retrieve a specific report by ID
 *     tags: [Reported Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportingId
 *         required: true
 *         description: The ID of the report
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested report
 *       400:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get(
    '/:reportingId',
    authenticateToken,
    checkDatabaseAdministrator,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('reportingId').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_REPORT_ID)
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    reportedUserController.getReportingById
);

/**
 * @swagger
 * /reported-users:
 *   post:
 *     summary: Create a new report
 *     tags: [Reported Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportedUserId
 *               - reason
 *             properties:
 *               reportedUserId:
 *                 type: string
 *                 description: The ID of the user being reported
 *               reason:
 *                 type: string
 *                 description: The reason for the report
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
    '/',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('reportedUserId').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID),
        check('reason').notEmpty().withMessage((value, { req }) => req.validationMessages.REASON_REQUIRED)
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    reportedUserController.createReport
);

/**
 * @swagger
 * /reported-users/delete/{id}:
 *   delete:
 *     summary: Delete a report by ID
 *     tags: [Reported Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the report to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/delete/:id',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('id').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_REPORT_ID)
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    reportedUserController.deleteReportById
);

module.exports = router;
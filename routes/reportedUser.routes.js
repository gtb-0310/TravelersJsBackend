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
 * /reported-users/{reportedUserId}/{reasonId}:
 *   post:
 *     summary: Create a new report
 *     tags: [Reported Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportedUserId
 *         required: true
 *         description: The ID of the user being reported
 *         schema:
 *           type: string
 *       - in: path
 *         name: reasonId
 *         required: true
 *         description: The ID of the reason for the report
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Additional details about the report
 *               evidence:
 *                 type: string
 *                 description: URL or path to the evidence file
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Reason or user not found
 *       500:
 *         description: Server error
 */
router.post(
    '/:reportedUserId/:reasonId',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('reportedUserId').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID),
        check('reasonId').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_REASON_ID)
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
 * /reported-users/banish/{reportId}:
 *   put:
 *     summary: Verify a report and ban the reported user
 *     tags: [Reported Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         description: The ID of the report to verify and take action on
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully banned the user based on the report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User banned successfully."
 *       404:
 *         description: Report or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report not found."
 *       500:
 *         description: Server error occurred during the process
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while processing the report."
 */
router.put(
    '/banish/:reportId',
    authenticateToken,
    checkDatabaseAdministrator,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('reportId').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_REPORT_ID)
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    reportedUserController.banishUser
);


/**
 * @swagger
 * /reported-users/delete/{reportId}:
 *   delete:
 *     summary: Delete a report by ID
 *     tags: [Reported Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
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
    '/delete/:reportId',
    authenticateToken,
    checkDatabaseAdministrator,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('reportId').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_REPORT_ID)
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
const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const privateMessageController = require('../controllers/privateMessage.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const validationMessages = require('../utils/messages');

/**
 * @swagger
 * tags:
 *   name: Private Messages
 *   description: Routes for private message operations
 */

/**
 * @swagger
 * /private-messages/conversation/{conversationId}:
 *   get:
 *     summary: Retrieve all messages in a specific conversation
 *     tags: [Private Messages]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         description: ID of the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.get(
    '/conversation/:conversationId',
    authenticateToken, 
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
      [
        check('conversationId')
            .isMongoId().withMessage((value, {req}) => req.validationMessages.INVALID_CONVERS_ID)
      ],
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
      privateMessageController.getMessagesByConversationId
);

/**
 * @swagger
 * /private-messages/{id}:
 *   get:
 *     summary: Retrieve a specific message by its ID
 *     tags: [Private Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the message
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested message
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
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
        check('id')
            .isMongoId().withMessage((value, {req}) => req.validationMessages.INVALID_MSG_ID)
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    privateMessageController.getPrivateMessageById
);

/**
 * @swagger
 * /private-messages/send:
 *   post:
 *     summary: Send a new private message
 *     tags: [Private Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: ID of the message sender
 *               recipientId:
 *                 type: string
 *                 description: ID of the message recipient
 *               content:
 *                 type: string
 *                 description: The message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       500:
 *         description: Server error
 */
router.post(
    '/send',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('senderId')
            .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID),
        check('recipientId')
            .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID),
        check('content')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.MSG_REQUIRED),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    privateMessageController.sendMessage
);

/**
 * @swagger
 * /private-messages/{id}:
 *   put:
 *     summary: Update the content of a specific message by its ID
 *     tags: [Private Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the message to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new message content
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.put(
    '/:id',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('id')
            .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_MSG_ID),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    privateMessageController.updateMessageById
);

/**
 * @swagger
 * /private-messages/{conversationId}:
 *   put:
 *     summary: Mark the last message in a conversation as read
 *     tags: [Private Messages]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         description: ID of the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Last message marked as read
 *       404:
 *         description: Conversation or message not found
 *       500:
 *         description: Server error
 */
router.put(
    '/conversation/:conversationId',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('conversationId')
            .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_CONVERS_ID),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    privateMessageController.markLastMessageAsRead
);

/**
 * @swagger
 * /private-messages/{id}:
 *   delete:
 *     summary: Delete a specific message by its ID
 *     tags: [Private Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the message to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:id',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    [
        check('id')
            .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_MSG_ID),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    privateMessageController.deleteMessageById
);

module.exports = router;
const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const privateConversationController = require('../controllers/privateConversation.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');

/**
 * @swagger
 * tags:
 *   name: Private Conversations
 *   description: Routes for private conversations operations
 */

/**
 * @swagger
 * /private-conversations/user/{userId}:
 *   get:
 *     summary: Get all conversations for a user
 *     tags: [Private Conversations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       senderId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *       404:
 *         description: No conversations found
 *       500:
 *         description: Server error
 */
router.get(
    '/user/:userId',
    authenticateToken,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
      [
        check('userId')
          .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID),
      ],
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
    privateConversationController.getAllConversationsByUserId
);

/**
 * @swagger
 * /private-conversations/{conversationId}:
 *   delete:
 *     summary: Delete a conversation by ID
 *     tags: [Private Conversations]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         description: ID of the conversation to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:conversationId',
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
    privateConversationController.deleteConversationById
);

/**
 * @swagger
 * /private-conversations/{conversationId}/add-participant:
 *   put:
 *     summary: Add a participant to a conversation
 *     tags: [Private Conversations]
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         description: ID of the conversation
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add to the conversation
 *     responses:
 *       200:
 *         description: User added to the conversation successfully
 *       400:
 *         description: User already in conversation
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.put(
    '/:conversationId/add-participant',
    authenticateToken,
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    [
      check('conversationId')
        .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_CONVERS_ID),
      check('userId')
        .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    privateConversationController.addParticipantToConversation
);

module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const groupMessageController = require('../controllers/groupMessage.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const validationMessages = require('../utils/messages');
const checkIfUserIsGroupMember = require('../middlewares/checkIfUserIsGroupMember');
const checkMessageSender = require('../middlewares/checkMessageSender');
const checkMessageSenderOrGroupAdmin = require('../middlewares/checkMessageSenderOrGroupAdmin');

/**
 * @swagger
 * tags:
 *   name: Group Messages
 *   description: API for managing group messages
 */

/**
 * @swagger
 * /group-messages/{groupId}/conversation:
 *   get:
 *     summary: Get all messages in a group conversation
 *     tags: [Group Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: Successfully retrieved conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The message ID
 *                       content:
 *                         type: string
 *                         description: The message content
 *                       groupId:
 *                         type: string
 *                         description: The ID of the group
 *                       senderId:
 *                         type: string
 *                         description: The ID of the sender
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp of the message
 *       400:
 *         description: Invalid group ID
 *       404:
 *         description: No conversation found
 *       500:
 *         description: Server error
 */
router.get(
  '/:groupId/conversation',
  authenticateToken,
  checkIfUserIsGroupMember,
  [
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
    check('groupId')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_GROUP_ID),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  groupMessageController.getConversationByGroupId
);

/**
 * @swagger
 * /group-messages/message/{id}:
 *   get:
 *     summary: Get a specific message by ID
 *     tags: [Group Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message
 *     responses:
 *       200:
 *         description: Successfully retrieved message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The message ID
 *                 content:
 *                   type: string
 *                   description: The message content
 *                 groupId:
 *                   type: string
 *                   description: The ID of the group
 *                 senderId:
 *                   type: string
 *                   description: The ID of the sender
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp of the message
 *       400:
 *         description: Invalid message ID
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.get(
  '/message/:id',
  authenticateToken,
  [
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
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
  groupMessageController.getGroupMessageById
);

/**
 * @swagger
 * /group-messages/{groupId}/sender/message:
 *   post:
 *     summary: Send a new message in a group
 *     tags: [Group Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The message ID
 *                 content:
 *                   type: string
 *                   description: The message content
 *                 groupId:
 *                   type: string
 *                   description: The ID of the group
 *                 senderId:
 *                   type: string
 *                   description: The ID of the sender
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp of the message
 *       400:
 *         description: Invalid data or missing content
 *       500:
 *         description: Server error
 */
router.post(
  '/:groupId/sender/message',
  authenticateToken,
  checkIfUserIsGroupMember,
  [
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    check('groupId')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_GROUP_ID),
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
  groupMessageController.sendMessage
);


/**
 * @swagger
 * /group-messages/message/{id}:
 *   put:
 *     summary: Update an existing message
 *     tags: [Group Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The new content of the message
 *     responses:
 *       200:
 *         description: Message updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The message ID
 *                 content:
 *                   type: string
 *                   description: The message content
 *                 groupId:
 *                   type: string
 *                   description: The ID of the group
 *                 senderId:
 *                   type: string
 *                   description: The ID of the sender
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp of the message
 *       400:
 *         description: Invalid data or missing content
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.put(
  '/message/:id',
  authenticateToken,
  checkMessageSender,
  [
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
    check('id')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_MSG_ID),
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
  groupMessageController.updateGroupMessage
);

/**
 * @swagger
 * /group-messages/message/{id}:
 *   delete:
 *     summary: Delete a message by ID
 *     tags: [Group Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       400:
 *         description: Invalid message ID
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/message/:id',
  authenticateToken,
  checkMessageSenderOrGroupAdmin,
  [
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
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
  groupMessageController.deleteGroupMessage
);

module.exports = router;

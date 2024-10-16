const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const mongoose = require('mongoose');
const groupConversationController = require('../controllers/groupConversation.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');
const checkIfConversationGroupMember = require('../middlewares/checkIfConversationGroupMember');


/**
 * @swagger
 * /group-conversations/conversations:
 *   get:
 *     summary: Récupère toutes les conversations de groupe de l'utilisateur connecté
 *     tags: [Group Conversations]
 *     security:
 *       - bearerAuth: []  # Utilise l'authentification par token (JWT)
 *     responses:
 *       200:
 *         description: Liste des conversations de groupe récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID de la conversation
 *                   groupId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID du groupe associé
 *                       name:
 *                         type: string
 *                         description: Nom du groupe
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       senderId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: ID de l'utilisateur ayant envoyé le dernier message
 *                           firstName:
 *                             type: string
 *                             description: Prénom de l'utilisateur
 *                           lastName:
 *                             type: string
 *                             description: Nom de l'utilisateur
 *                       content:
 *                         type: string
 *                         description: Contenu du dernier message
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: Date et heure du dernier message
 *       404:
 *         description: Aucune conversation trouvée pour l'utilisateur
 *       500:
 *         description: Erreur interne du serveur
 */
router.get(
    '/conversations',
    authenticateToken,
    groupConversationController.getConversationsForAuthenticateUser
)


/**
 * @swagger
 * /group-conversations/conversation/{conversationId}:
 *   get:
 *     summary: Récupère une conversation de groupe par son ID
 *     tags: [Group Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           description: L'ID de la conversation de groupe
 *     responses:
 *       200:
 *         description: Conversation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID de la conversation
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                   description: Liste des participants à la conversation
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Liste des messages dans la conversation
 *       403:
 *         description: Utilisateur non autorisé à voir cette conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur non autorisé à voir cette conversation
 *       404:
 *         description: Conversation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Conversation non trouvée
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Une erreur serveur est survenue
 */
router.get(
    '/conversation/:conversationId',
    authenticateToken,
    checkIfConversationGroupMember,
    check('conversationId')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_CONVERS_ID),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    groupConversationController.getGroupConversationById
  );


module.exports = router;
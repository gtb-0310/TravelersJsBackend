const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const blockedUserController = require('../controllers/blockedUser.controller');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');

/**
 * @swagger
 * tags:
 *   name: Blocked users
 */

/**
 * @swagger
 * /blocked-users:
 *   get:
 *     summary: Récupère les utilisateurs bloqués par un utilisateur spécifique
 *     tags: [Blocked users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs bloqués
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   blockedUserId:
 *                     type: string
 *                     description: ID de l'utilisateur bloqué
 *       404:
 *         description: Utilisateur bloquant non trouvé
 */
router.get(
  '/',
  authenticateToken,
  [
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    check('blockedUserId')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_BLOCKED_USER_ID),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  blockedUserController.getBlockedUserById);

/**
 * @swagger
 * /blocked-users:
 *   post:
 *     summary: Bloque un utilisateur
 *     tags: [Blocked users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blockedUserId:
 *                 type: string
 *                 description: ID de l'utilisateur à bloquer
 *     responses:
 *       201:
 *         description: Utilisateur bloqué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blockingUserId:
 *                   type: string
 *                   description: ID de l'utilisateur qui bloque (récupéré via JWT)
 *                 blockedUserId:
 *                   type: string
 *                   description: ID de l'utilisateur bloqué
 *       400:
 *         description: Requête invalide (champs manquants ou incorrects)
 *       500:
 *         description: Erreur lors du blocage de l'utilisateur
 */
router.post(
    '/',
    authenticateToken,
    [
      (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
      check('blockedUserId')
        .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_BLOCKED_USER_ID),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    blockedUserController.createBlockedUser
  );

/**
 * @swagger
 * /blocked-users/{blockedUserDocId}:
 *   delete:
 *     summary: Débloque un utilisateur
 *     tags: [Blocked users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockedUserDocId
 *         required: true
 *         description: ID du document
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur débloqué avec succès
 *       404:
 *         description: Relation de blocage non trouvée
 *       500:
 *         description: Erreur lors du déblocage de l'utilisateur
 */
router.delete(
    '/:blockedUserDocId',
    [
      (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
      check('blockedUserDocId')
        .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_BLOCKED_DOC_ID),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    blockedUserController.deleteBlockedUser
  );

module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

/**
 * @swagger
 * tags:
 *   name: Authentification
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connecte un utilisateur et retourne un accessToken et un refreshToken
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'adresse email de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'utilisateur
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Mot de passe incorrect
 *       500:
 *         description: Erreur du serveur
 */
router.post(
    '/login',
    [
      (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang]; // Ajouter les messages à la requête pour un accès facile
        next();
      },
      check('email')
        .isEmail().withMessage((value, { req }) => req.validationMessages.INVALID_EMAIL)
        .normalizeEmail(),
      check('password')
        .isLength({ min: 5 }).withMessage((value, { req }) => req.validationMessages.PASSWORD_TOO_SHORT)
        .trim().escape(),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    authController.login
  );
  

/**
 * @swagger
 * /auth/token:
 *   post:
 *     summary: Rafraîchit le accessToken en utilisant le refreshToken
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Le refreshToken valide
 *     responses:
 *       200:
 *         description: Nouveau accessToken généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh Token manquant ou session expirée
 *       403:
 *         description: Refresh Token invalide ou session expirée
 *       500:
 *         description: Erreur du serveur
 */
router.post(
    '/token',
    [
      (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang]; // Ajouter les messages à la requête pour un accès facile
        next();
      },
      check('token')
        .notEmpty().withMessage((value, { req }) => req.validationMessages.CONNECTION_REQUIRED)
        .trim().escape(),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    authController.refreshToken
  );
  

// Si tu décides d'ajouter la déconnexion côté serveur plus tard, tu pourras décommenter la ligne suivante
// router.post('/logout', authController.logout);

module.exports = router;

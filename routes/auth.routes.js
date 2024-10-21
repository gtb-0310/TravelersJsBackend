const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');
const path = require('path');
const checkBanStatus = require('../middlewares/checkBanStatus');

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
  checkBanStatus,
  '/login',
  [
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
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
        req.validationMessages = messages[lang];
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


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnecte l'utilisateur en révoquant le refreshToken
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
 *                 description: Le refreshToken à révoquer
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       400:
 *         description: Token manquant ou utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.post(
  '/logout',
  [
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    check('token')
      .notEmpty().withMessage((value, { req }) => req.validationMessages.MISSING_TOKEN)
      .trim().escape(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.logout
);

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Demande une réinitialisation de mot de passe pour un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'adresse email de l'utilisateur pour laquelle le mot de passe doit être réinitialisé
 *     responses:
 *       200:
 *         description: Un email a été envoyé pour réinitialiser le mot de passe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Un email a été envoyé pour réinitialiser le mot de passe."
 *       400:
 *         description: Email invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.post(
  '/request-password-reset',
  [
      (req, res, next) => {
          const lang = getLanguageFromHeaders(req) || 'en';
          req.validationMessages = messages[lang];
          next();
      },
      check('email')
          .isEmail().withMessage((value, { req }) => req.validationMessages.INVALID_EMAIL)
          .normalizeEmail(),
  ],
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      next();
  },
  authController.requestPasswordReset
);


/**
* @swagger
* /auth/reset-password/{resetToken}:
*   post:
*     summary: Réinitialise le mot de passe de l'utilisateur
*     tags: [Authentification]
*     parameters:
*       - in: path
*         name: resetToken
*         required: true
*         schema:
*           type: string
*         description: Le token de réinitialisation de mot de passe reçu par email
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - newPassword
*               - confirmPassword
*             properties:
*               newPassword:
*                 type: string
*                 description: Le nouveau mot de passe que l'utilisateur souhaite définir
*               confirmPassword:
*                 type: string
*                 description: Confirmation du nouveau mot de passe
*     responses:
*       200:
*         description: Mot de passe réinitialisé avec succès
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: "Mot de passe réinitialisé avec succès."
*       400:
*         description: Token invalide ou expiré, ou données invalides
*       500:
*         description: Erreur du serveur
*/
router.post(
  '/reset-password/:resetToken',
  [
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    check('newPassword')
      .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_NEW_PASSWORD)
      .isLength({ min: 5 }).withMessage((value, { req }) => req.validationMessages.PASSWORD_TOO_SHORT)
      .trim().escape(),
    check('confirmPassword')
      .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_CONFIRM_PASSWORD)
      .custom((value, { req }) => value === req.body.newPassword).withMessage((value, { req }) => req.validationMessages.PASSWORDS_MUST_MATCH),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  authController.resetPassword
);

router.get('/reset-password/:resetToken', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/resetPassword.html'));  // Chemin vers ta page HTML
});


/**
 * @swagger
 * /auth/verify-email/{token}:
 *   put:
 *     summary: Vérifie l'email de l'utilisateur
 *     tags: [Authentification]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Le token de vérification d'email reçu par l'utilisateur
 *     responses:
 *       200:
 *         description: Email vérifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email vérifié avec succès."
 *       400:
 *         description: Token invalide ou expiré
 *       500:
 *         description: Erreur du serveur
 */
router.get(
  '/verify-email/:token',
  [
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    check('token')
        .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_VERIFICATION_TOKEN)
        .isString().withMessage((value, { req }) => req.validationMessages.INVALID_VERIFICATION_TOKEN)
        .trim().escape(),
  ],
  (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      next();
  },
  authController.verifyEmail

);


module.exports = router;

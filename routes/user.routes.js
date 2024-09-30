const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');
const checkOwnerProfil = require('../middlewares/checkOwnerProfil');

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.get(
    '/:id',
    authenticateToken,
    [
      (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
      },
      check('id').isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID)
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    userController.getUserById
);


/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Utilisateurs]
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
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation de mot de passe
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: Date de naissance de l'utilisateur
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur du serveur
 */
router.post(
    '/',
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
    userController.createUser
);


/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Met à jour les informations d'un utilisateur par son ID
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - profilePictureUrl
 *               - description
 *               - languages
 *               - interests
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profilePictureUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ObjectId de la langue
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ObjectId de l'intérêt
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 profilePictureUrl:
 *                   type: string
 *                 description:
 *                   type: string
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 interests:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.put(
    '/:id',
    authenticateToken,
    checkOwnerProfil,
    [
        (req, res, next) => {
            const lang = getLanguageFromHeaders(req) || 'en';
            req.validationMessages = messages[lang];
            next();
        },
        check('id')
        .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_GROUP_ID),
        check('firstName')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_FIRST_NAME)
            .isString().withMessage((value, { req }) => req.validationMessages.INVALID_FIRST_NAME)
            .trim().escape(),
        check('lastName')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_LAST_NAME)
            .isString().withMessage((value, { req }) => req.validationMessages.INVALID_LAST_NAME)
            .trim().escape(),
        check('profilePictureUrl')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_PROFILE_PICTURE_URL)
            .isURL().withMessage((value, { req }) => req.validationMessages.INVALID_PROFILE_PICTURE_URL),
        check('description')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_DESCRIPTION)
            .isString().withMessage((value, { req }) => req.validationMessages.INVALID_DESCRIPTION)
            .trim().escape(),
        check('languages')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_LANGUAGES)
            .isArray().withMessage((value, { req }) => req.validationMessages.INVALID_LANGUAGES)
            .custom((languages, { req }) => {
                return languages.every(lang => mongoose.Types.ObjectId.isValid(lang));
            }).withMessage((value, { req }) => req.validationMessages.INVALID_LANGUAGE_ID),
        check('interests')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_INTERESTS)
            .isArray().withMessage((value, { req }) => req.validationMessages.INVALID_INTERESTS)
            .custom((interests, { req }) => {
                return interests.every(interest => mongoose.Types.ObjectId.isValid(interest));
            }).withMessage((value, { req }) => req.validationMessages.INVALID_INTEREST_ID),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    userController.updateUserById
);


/**
 * @swagger
 * /users/{id}/change-password:
 *   put:
 *     summary: Change le mot de passe d'un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur dont le mot de passe doit être changé
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Le mot de passe actuel de l'utilisateur
 *               newPassword:
 *                 type: string
 *                 description: Le nouveau mot de passe de l'utilisateur
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mot de passe mis à jour avec succès."
 *       400:
 *         description: Mot de passe actuel incorrect ou données invalides
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.put(
    '/:id/change-password',
    authenticateToken,
    checkOwnerProfil,
    [
        (req, res, next) => {
            const lang = getLanguageFromHeaders(req) || 'en';
            req.validationMessages = messages[lang];
            next();
        },
        check('currentPassword')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_CURRENT_PASSWORD)
            .isLength({ min: 5 }).withMessage((value, { req }) => req.validationMessages.PASSWORD_TOO_SHORT),
        check('newPassword')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_NEW_PASSWORD)
            .isLength({ min: 5 }).withMessage((value, { req }) => req.validationMessages.PASSWORD_TOO_SHORT),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    userController.changePassword
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
    userController.requestPasswordReset
);


/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialise le mot de passe de l'utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Le token de réinitialisation de mot de passe reçu par email
 *               newPassword:
 *                 type: string
 *                 description: Le nouveau mot de passe que l'utilisateur souhaite définir
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
    '/reset-password',
    [
        (req, res, next) => {
            const lang = getLanguageFromHeaders(req) || 'en';
            req.validationMessages = messages[lang];
            next();
        },
        check('token')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_RESET_TOKEN)
            .isString().withMessage((value, { req }) => req.validationMessages.INVALID_RESET_TOKEN),
        check('newPassword')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_NEW_PASSWORD)
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
    userController.resetPassword
);


/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprime le profil d'un utilisateur et ses données associées
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Profil utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profil utilisateur supprimé avec succès."
 *       400:
 *         description: ID utilisateur invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.delete(
    '/:id',
    authenticateToken,
    checkOwnerProfil,
    [
        (req, res, next) => {
            const lang = getLanguageFromHeaders(req) || 'en';
            req.validationMessages = messages[lang];
            next();
        },
        check('id')
            .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID)
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    userController.deleteUserProfilById
);


module.exports = router;
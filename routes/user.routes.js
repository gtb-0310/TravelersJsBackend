const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const messages = require('../utils/messages');
const checkOwnerToModifProfil = require('../middlewares/checkOwnerToModifProfil');
const multer = require('multer');
//const checkImagesFormatUpload = multer({ dest: 'uploads/' });
const { upload, deleteTemporaryFile } = require('../middlewares/checkImagesFormatUpload');

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
 * /users:
 *   put:
 *     summary: Met à jour les informations de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - description
 *               - languages
 *               - interests
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Prénom de l'utilisateur
 *               lastName:
 *                 type: string
 *                 description: Nom de famille de l'utilisateur
 *               description:
 *                 type: string
 *                 description: Une description de l'utilisateur
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ObjectId des langues que l'utilisateur parle
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ObjectId des intérêts de l'utilisateur
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
 *                   description: ID de l'utilisateur
 *                 firstName:
 *                   type: string
 *                 lastName:
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
    '/',
    authenticateToken,
    checkOwnerToModifProfil,
    [
        (req, res, next) => {
            const lang = getLanguageFromHeaders(req) || 'en';
            req.validationMessages = messages[lang];
            next();
        },
        check('firstName')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_FIRST_NAME)
            .isString().withMessage((value, { req }) => req.validationMessages.INVALID_FIRST_NAME)
            .trim(),
        check('lastName')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_LAST_NAME)
            .isString().withMessage((value, { req }) => req.validationMessages.INVALID_LAST_NAME)
            .trim(),
        check('description')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_DESCRIPTION)
            .isString().withMessage((value, { req }) => req.validationMessages.INVALID_DESCRIPTION)
            .trim(),
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
    userController.updateUser
);


/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change le mot de passe de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Le mot de passe actuel de l'utilisateur
 *               newPassword:
 *                 type: string
 *                 description: Le nouveau mot de passe de l'utilisateur
 *               confirmNewPassword:
 *                 type: string
 *                 description: Confirmation du nouveau mot de passe
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
    '/change-password',
    authenticateToken,
    checkOwnerToModifProfil,
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
        check('confirmNewPassword')
            .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_CONFIRM_PASSWORD)
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
 * /users/profile-picture:
 *   put:
 *     summary: Update the user's profile picture
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: The new profile picture file to upload
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile picture updated successfully."
 *                 profilePictureUrl:
 *                   type: string
 *                   example: "https://res.cloudinary.com/your-cloud-name/image/upload/v1625488900/profile-pictures/sample.jpg"
 *       400:
 *         description: Bad request, image not provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image file is required."
 *       401:
 *         description: Unauthorized, user not authenticated
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Server error occurred during the upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to update profile picture."
 */
router.put(
    '/profile-picture',
    authenticateToken,
    checkOwnerToModifProfil,
    upload.single('profilePicture'),
    userController.updateProfilePicture,
    deleteTemporaryFile
);



/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Supprime le profil d'un utilisateur et ses données associées
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
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
    '/',
    authenticateToken,
    checkOwnerToModifProfil,
    (req, res, next) => {
        const lang = getLanguageFromHeaders(req) || 'en';
        req.validationMessages = messages[lang];
        next();
    },
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    userController.deleteUserProfil
);


module.exports = router;
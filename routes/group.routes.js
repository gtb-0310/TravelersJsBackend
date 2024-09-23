const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const mongoose = require('mongoose');
const groupController = require('../controllers/group.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const checkGroupAdmin = require('../middlewares/checkGroupAdmin');
const messages = require('../utils/messages');


/**
 * @swagger
 * tags:
 *   name: Groups
 */

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Récupère un groupe par son ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du groupe
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Un groupe trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 */
router.get(
  '/:groupId',
  authenticateToken,
  (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    req.validationMessages = messages[lang];
    next();
  },
  [
    check('groupId')
        .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_GROUP_ID)
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  groupController.getGroupById
);

/**
 * @swagger
 * /groups/user/groups:
 *   get:
 *     summary: Récupère les groupes de l'utilisateur authentifié
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Une liste de groupes de l'utilisateur authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       500:
 *         description: Erreur du serveur
 */
router.get(
  '/user/groups',
  authenticateToken,
  (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    req.validationMessages = messages[lang];
    next();
  },
  groupController.getGroupsByUserId
);


/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Crée un nouveau groupe
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du groupe
 *                 required: true
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des membres du groupe (doit être un ObjectId)
 *                 required: true
 *               administrator:
 *                 type: string
 *                 description: Id de l'administrateur du groupe
 *                 required: true
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des langues parlées dans le groupe (doit être un ObjectId)
 *                 required: true
 *               trip:
 *                 type: string
 *                 description: ID du voyage associé au groupe (doit être un ObjectId)
 *                 required: true
 *     responses:
 *       201:
 *         description: Groupe créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *               administrator:
 *                 type: string
 *                 description: Id de l'administrateur du groupe
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 trip:
 *                   type: string
 *       400:
 *         description: Erreur de validation
 */
// router.post(
//     '/',
//     authenticateToken,
//     (req, res, next) => {
//       const lang = getLanguageFromHeaders(req) || 'en';
//       req.validationMessages = messages[lang];
//       next();
//     },
//     [
//       check('trip')
//         .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_TRIP_ID),
//       check('name')
//         .isString().withMessage((value, { req }) => req.validationMessages.INVALID_NAME)
//         .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_NAME),
//       check('members')
//         .custom((members, { req }) => {
//           if (!Array.isArray(members) || members.length === 0) {
//             throw new Error(req.validationMessages.REQUIRED_MEMBERS);
//           }
//           members.forEach(memberId => {
//             if (!mongoose.Types.ObjectId.isValid(memberId)) {
//               throw new Error(req.validationMessages.INVALID_MEMBER_ID);
//             }
//           });
//           return true;
//         }),
//       check('administrators')
//         .custom((administrators, { req }) => {
//           if (!Array.isArray(administrators) || administrators.length === 0) {
//             throw new Error(req.validationMessages.REQUIRED_ADMINS);
//           }
//           administrators.forEach(adminId => {
//             if (!mongoose.Types.ObjectId.isValid(adminId)) {
//               throw new Error(req.validationMessages.INVALID_ADMIN_ID);
//             }
//           });
//           return true;
//         }),
//       check('languages')
//         .custom((languages, { req }) => {
//           if (!Array.isArray(languages) || languages.length === 0) {
//             throw new Error(req.validationMessages.REQUIRED_LANGUAGES);
//           }
//           languages.forEach(languageId => {
//             if (!mongoose.Types.ObjectId.isValid(languageId)) {
//               throw new Error(req.validationMessages.INVALID_LANGUAGE_ID);
//             }
//           });
//           return true;
//         }),
//     ],
//     (req, res, next) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }
//       next();
//     },
//     groupController.createGroup
//   );


/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Supprime un groupe par son ID (ADMINISTRATEUR)
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du groupe à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Groupe supprimé avec succès
 */
router.delete(
    '/:id',
    authenticateToken,
    checkGroupAdmin,
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    check('id')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_GROUP_ID),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    groupController.deleteGroupById
  );

/**
 * @swagger
 * /groups/{groupId}/users/{userId}:
 *   delete:
 *     summary: Supprime un utilisateur d'un groupe (ADMINISTRATEUR)
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID du groupe
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur à supprimer du groupe
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur retiré du groupe avec succès
 */
router.delete(
    '/:groupId/users/:userId',
    authenticateToken,
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    [
      check('groupId')
        .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_GROUP_ID),
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
    groupController.removeUserFromGroup
  );


module.exports = router;
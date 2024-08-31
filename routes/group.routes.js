const express = require('express');
    router = express.Router(),
    groupController = require('../controllers/group.controller'),
    { check, validationResult } = require('express-validator'),
    authenticateToken = require('../middlewares/authenticateToken'),
    checkAdminOrRequestOwner = require('../middlewares/checkAdminOrRequestOwner'),
    getLanguageFromHeaders = require('../utils/languageUtils'),
    messages = require('../utils/messages'),
    mongoose = require('mongoose');


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
router.get('/:id', authenticateToken, groupController.getGroupById);

/**
 * @swagger
 * /groups/user/{userId}:
 *   get:
 *     summary: Récupère les groupes d'un utilisateur par son ID
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Une liste de groupes
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
 */
router.get('/user/:userId', authenticateToken, groupController.getGroupsByUserId);

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
 *               administrators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des administrateurs du groupe (doit être un ObjectId)
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
 *                 administrators:
 *                   type: array
 *                   items:
 *                     type: string
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
    checkAdminOrRequestOwner,
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
    checkAdminOrRequestOwner,
    groupController.removeUserFromGroup
  );



/**
 * @swagger
 * /groups/{groupId}/addAdmin/{userId}:
 *   post:
 *     summary: Ajoute un utilisateur en tant qu'administrateur d'un groupe (ADMINISTRATEUR)
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
 *         description: ID de l'utilisateur à ajouter comme administrateur
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []  # Si vous utilisez JWT ou un autre mécanisme d'authentification par jeton
 *     responses:
 *       200:
 *         description: Utilisateur ajouté en tant qu'administrateur du groupe avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: L'utilisateur a été ajouté avec succès en tant qu'administrateur.
 *                 group:
 *                   type: object
 *                   description: Le groupe mis à jour après l'ajout de l'administrateur
 *       400:
 *         description: L'utilisateur est déjà administrateur du groupe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: L'utilisateur est déjà administrateur du groupe.
 *       404:
 *         description: Groupe non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Groupe non trouvé.
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Une erreur est survenue.
 */

router.post('/:groupId/addAdmin/:userId', authenticateToken, groupController.addAdminToGroup);



module.exports = router;

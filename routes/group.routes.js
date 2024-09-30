const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const mongoose = require('mongoose');
const groupController = require('../controllers/group.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const checkGroupAdmin = require('../middlewares/checkGroupAdmin');
const checkGroupAdminOrSelf = require('../middlewares/checkGroupAdminOrSelf');
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
 *     security:
 *       - bearerAuth: []
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
 * /groups/dissolve/{id}:
 *   put:
 *     summary: Dissout un groupe en réinitialisant les membres et les langues
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe à dissoudre
 *     responses:
 *       200:
 *         description: Groupe dissous avec succès
 *       403:
 *         description: L'utilisateur n'a pas les droits d'administrateur pour ce groupe
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put(
  '/dissolve/:id',
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
  groupController.dissolveGroupById
);


/**
 * @swagger
 * /groups/{groupId}/users/{userId}:
 *   delete:
 *     summary: Supprime un utilisateur d'un groupe (ADMINISTRATEUR ou utilisateur quittant le groupe)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
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
 *         description: Utilisateur retiré du groupe avec succès, et mise à jour des langues du groupe si nécessaire.
 *       403:
 *         description: L'utilisateur est le dernier membre et doit supprimer le Trip ou l'utilisateur n'est pas autorisé à retirer cet utilisateur.
 *       400:
 *         description: Erreur de validation des paramètres (groupId ou userId non valide).
 *       404:
 *         description: Groupe ou utilisateur non trouvé dans le groupe.
 *       500:
 *         description: Erreur du serveur.
 */
router.delete(
  '/:groupId/users/:userId',
  authenticateToken,
  checkGroupAdminOrSelf,
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
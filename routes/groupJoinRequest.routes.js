const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');
const groupController = require('../controllers/groupJoinRequest.controller');
const getLanguageFromHeaders = require('../utils/languageUtils');
const validationMessages = require('../utils/messages');
const checkGroupAdmin = require('../middlewares/checkGroupAdmin');
const messages = require('../utils/messages');
const canApproveAddRequest = require('../middlewares/canApproveAddRequest');
const checkIfAlreadyMember = require('../middlewares/checkIfAlreadyMember');
const checkDeleteRequestPermission = require('../middlewares/checkDeleteRequestPermission');
//const checkOwnerProfil = require('../middlewares/checkOwnerProfil');

/**
 * @swagger
 * tags:
 *   name: Group join requests
 */

/**
 * @swagger
 * /group-join/{groupId}/join-requests:
 *   get:
 *     summary: Récupère la liste des demandes pour rejoindre un groupe spécifique (ADMINISTRATEUR)
 *     tags: [Group join requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe dont on veut récupérer les requêtes
 *     responses:
 *       200:
 *         description: Liste des demandes pour rejoindre le groupe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: ID de l'utilisateur qui a fait la demande
 *                   firstName:
 *                     type: string
 *                     description: Prénom de l'utilisateur
 *                   lastName:
 *                     type: string
 *                     description: Nom de famille de l'utilisateur
 *                   age:
 *                     type: number
 *                     description: Âge de l'utilisateur
 *                   languages:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Langues parlées par l'utilisateur
 *                   interests:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Centres d'intérêt de l'utilisateur
 *                   description:
 *                     type: string
 *                     description: Description de l'utilisateur
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       403:
 *         description: Accès refusé. L'utilisateur n'est pas un administrateur du groupe.
 *       500:
 *         description: Erreur du serveur
 */
router.get(
  '/:groupId/join-requests',
  authenticateToken,
  checkGroupAdmin,
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
  groupController.getJoinRequestsByGroupId
);


/**
 * @swagger
 * /group-join/user/{userId}/join-requests:
 *   get:
 *     summary: L'utilisateur récupère la liste de ses demandes d'adhésions aux groupes tiers
 *     tags: [Group join requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur dont on veut récupérer les demandes
 *     responses:
 *       200:
 *         description: Liste des demandes d'adhésion de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   groupId:
 *                     type: string
 *                     description: ID du groupe auquel l'utilisateur a demandé à rejoindre
 *                   firstName:
 *                     type: string
 *                     description: Prénom de l'utilisateur
 *                   lastName:
 *                     type: string
 *                     description: Nom de famille de l'utilisateur
 *                   age:
 *                     type: number
 *                     description: Âge de l'utilisateur
 *                   languages:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Langues parlées par l'utilisateur
 *                   interests:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Centres d'intérêt de l'utilisateur
 *                   description:
 *                     type: string
 *                     description: Description de l'utilisateur
 *       401:
 *         description: Non authentifié (token manquant ou invalide)
 *       404:
 *         description: Aucune demande d'adhésion trouvée pour cet utilisateur
 *       500:
 *         description: Erreur du serveur
 */
router.get(
  '/user/:userId/join-requests',
  authenticateToken,
  [
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
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
  groupController.getJoinRequestsByUserId
);


/**
 * @swagger
 * /group-join/{groupId}/join/{userId}:
 *   post:
 *     summary: L'utilisateur envoi une requête pour rejoindre un groupe qu'il voudrait rejoindre
 *     tags: [Group join requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du groupe auquel l'utilisateur veut adhérer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur qui demande à rejoindre le groupe
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message optionnel accompagnant la demande d'adhésion
 *     responses:
 *       201:
 *         description: Demande d'adhésion envoyée avec succès
 *       400:
 *         description: L'utilisateur est déjà membre du groupe
 *       403:
 *         description: L'administrateur n'est pas valide pour ce groupe
 *       404:
 *         description: Groupe non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.post(
    '/:groupId/join/:userId/',
    authenticateToken,
    checkIfAlreadyMember,
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
    groupController.askGroupJoinRequest
);


/**
 * @swagger
 * /group-join/join-request/{requestId}/approve:
 *   post:
 *     summary: Approuve une demande d'adhésion et ajoute l'utilisateur au groupe (ADMINISTRATEUR)
 *     tags: [Group join requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la demande d'adhésion à approuver
 *     responses:
 *       200:
 *         description: Demande d'adhésion approuvée avec succès
 *       403:
 *         description: Accès refusé. L'utilisateur n'est pas un administrateur du groupe.
 *       404:
 *         description: Demande d'adhésion non trouvée
 *       500:
 *         description: Erreur du serveur
 */
router.post(
  '/join-request/:requestId/approve',
  authenticateToken,
  canApproveAddRequest,
  [
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    check('requestId')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_REQUEST_ID),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  groupController.approveGroupJoinRequest
);


/**
 * @swagger
 * /group-join/join-request/{id}:
 *   delete:
 *     summary: Supprime une demande d'adhésion par son ID (seulement pour les administrateurs du groupe ou l'utilisateur ayant fait la demande) (ADMINISTRATEUR)
 *     tags: [Group join requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la demande d'adhésion à supprimer
 *     responses:
 *       200:
 *         description: Demande d'adhésion supprimée avec succès
 *       403:
 *         description: Accès refusé. L'utilisateur n'est pas autorisé à supprimer cette demande.
 *       404:
 *         description: Demande d'adhésion non trouvée
 *       500:
 *         description: Erreur du serveur
 */
router.delete(
  '/join-request/:id',
  authenticateToken,
  checkDeleteRequestPermission,
  [
    (req, res, next) => {
      const lang = getLanguageFromHeaders(req) || 'en';
      req.validationMessages = messages[lang];
      next();
    },
    check('id')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_REQUEST_ID),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  groupController.deleteJoinRequestById
);


module.exports = router;

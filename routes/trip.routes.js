const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const mongoose = require('mongoose');
const tripController = require('../controllers/trip.controller');
const authenticateToken = require('../middlewares/authenticateToken');
const getLanguageFromHeaders = require('../utils/languageUtils');
const checkTripAdministrator = require('../middlewares/checkTripAdministrator');
const messages = require('../utils/messages');


/**
 * @swagger
 * /trips:
 *   get:
 *     summary: Récupère une liste de trips avec filtres
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []  # Si vous utilisez JWT ou un autre mécanisme d'authentification par jeton
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filtrer par date de début du trip (au format ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Filtrer par date de fin du trip (au format ISO 8601)
 *       - in: query
 *         name: dateOption
 *         schema:
 *           type: string
 *           enum: [exact, range, start, end]
 *         required: false
 *         description: Option pour filtrer les dates (exact, range, start, end)
 *       - in: query
 *         name: budget
 *         schema:
 *           type: string
 *           example: "500,1000"
 *         required: false
 *         description:  >
 *            Filtrer par budget, avec une plage de valeurs séparées par une virgule ex: "500,1000"
 *       - in: query
 *         name: transport
 *         schema:
 *           type: string
 *           example: "60d5f6f9f8d78c6e7a2f8b90,60d5f6f9f8d78c6e7a2f8b91"
 *         required: false
 *         description: Filtrer par transport (liste d'IDs séparés par des virgules)
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *           format: objectId
 *         required: false
 *         description: Filtrer par destination (ID de la destination)
 *       - in: query
 *         name: tripType
 *         schema:
 *           type: string
 *           format: objectId
 *         required: false
 *         description: Filtrer par type de trip (ID du type de trip)
 *       - in: query
 *         name: languages
 *         schema:
 *           type: string
 *           format: objectId
 *         required: false
 *         description: Filtrer par langue parlée dans le groupe (ID de la langue)
 *     responses:
 *       200:
 *         description: Liste de trips récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID du trip
 *                   title:
 *                     type: string
 *                     description: Titre du trip
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Date de début du trip
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: Date de fin du trip
 *                   budget:
 *                     type: number
 *                     description: Budget du trip
 *                   transport:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         typeTransport:
 *                           type: string
 *                     description: Liste des moyens de transport associés au trip
 *                   destination:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                     description: Nom de la destination du trip
 *                   groupId:
 *                     type: object
 *                     properties:
 *                       languages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                         description: Liste des langues parlées par les membres du groupe
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Une erreur est survenue lors de la récupération des trips.
 */
router.get(
  '/',
  authenticateToken,
  (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    req.validationMessages = messages[lang];
    next();
  },
  [
    check('startDate')
      .optional()
      .isISO8601().withMessage((value, { req }) => req.validationMessages.INVALID_START_DATE),
    check('endDate')
      .optional()
      .isISO8601().withMessage((value, { req }) => req.validationMessages.INVALID_END_DATE)
      .custom((endDate, { req }) => {
        if (req.query.startDate && new Date(endDate) < new Date(req.query.startDate)) {
          throw new Error(req.validationMessages.INVALID_DATE_RANGE);
        }
        return true;
      }),
    check('budget')
      .optional()
      .matches(/^\d+(,\d+)?$/).withMessage((value, { req }) => req.validationMessages.INVALID_BUDGET),
    check('transport')
      .optional()
      .custom((transport, { req }) => {
        const transportArray = transport.split(',');
        transportArray.forEach(id => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(req.validationMessages.INVALID_TRANSPORT_ID);
          }
        });
        return true;
      }),
    check('destination')
      .optional()
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_DESTINATION_ID),
    check('tripType')
      .optional()
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_TRIP_TYPE_ID),
    check('languages')
      .optional()
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_LANGUAGE_ID),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  tripController.getTripsWithFilter
);

/**
 * @swagger
 * /trips/{id}:
 *   get:
 *     summary: Récupère les détails d'un trip par son ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du trip à récupérer
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []  # Si vous utilisez JWT ou un autre mécanisme d'authentification par jeton
 *     responses:
 *       200:
 *         description: Détails du trip récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID du trip
 *                 title:
 *                   type: string
 *                   description: Titre du trip
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Date de début du trip
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Date de fin du trip
 *                 budget:
 *                   type: number
 *                   description: Budget du trip
 *                 userId:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                   description: Informations sur l'utilisateur qui a créé le trip
 *                 transport:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       typeTransport:
 *                         type: string
 *                   description: Liste des moyens de transport associés au trip
 *                 destination:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                   description: Nom de la destination du trip
 *                 tripType:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                   description: Type de trip
 *                 groupId:
 *                   type: object
 *                   properties:
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       description: Liste des langues parlées par les membres du groupe
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                       description: Liste des membres du groupe associés au trip
 *       404:
 *         description: Trip non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trip non trouvé.
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Une erreur est survenue lors de la récupération du trip.
 */
router.get(
  '/:id',
  authenticateToken,
  (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    req.validationMessages = messages[lang];
    next();
  },
  [
    check('id')
        .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_TRIP_ID)
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  tripController.getTripById
);

/**
 * @swagger
 * /trips:
 *   post:
 *     summary: Crée un nouveau trip (et un groupe associé)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startDate
 *               - endDate
 *               - budget
 *               - userId
 *               - transport
 *               - destination
 *               - tripType
 *             properties:
 *               title:
 *                 type: string
 *                 description: Le titre du trip
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: La date de début du trip (au format ISO 8601)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: La date de fin du trip (au format ISO 8601)
 *               budget:
 *                 type: number
 *                 description: Le budget estimé pour le trip
 *               userId:
 *                 type: string
 *                 format: objectId
 *                 description: ID de l'utilisateur créateur du trip
 *               transport:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                 description: Liste des IDs des moyens de transport pour le trip
 *               destination:
 *                 type: string
 *                 format: objectId
 *                 description: ID de la destination du trip
 *               tripType:
 *                 type: string
 *                 format: objectId
 *                 description: ID du type de trip
 *     responses:
 *       201:
 *         description: Trip créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID du trip créé
 *                 title:
 *                   type: string
 *                   description: Titre du trip
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Date de début du trip
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Date de fin du trip
 *                 budget:
 *                   type: number
 *                   description: Budget du trip
 *                 userId:
 *                   type: string
 *                   description: ID de l'utilisateur créateur du trip
 *                 transport:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Liste des moyens de transport du trip
 *                 destination:
 *                   type: string
 *                   description: ID de la destination du trip
 *                 tripType:
 *                   type: string
 *                   description: ID du type de trip
 *                 groupId:
 *                   type: string
 *                   description: ID du groupe associé au trip
 *       400:
 *         description: Requête invalide (erreur de validation des champs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Message d'erreur
 *                       param:
 *                         type: string
 *                         description: Paramètre en erreur
 *                       location:
 *                         type: string
 *                         description: Emplacement du paramètre (ex. "body")
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur non trouvé.
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Une erreur est survenue lors de la création du trip.
 */
router.post(
  '/',
  authenticateToken,
  (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    req.validationMessages = messages[lang];
    next();
  },
  [
    check('title')
      .isString().withMessage((value, { req }) => req.validationMessages.INVALID_NAME)
      .notEmpty().withMessage((value, { req }) => req.validationMessages.REQUIRED_NAME),
    check('startDate')
      .isISO8601().withMessage((value, { req }) => req.validationMessages.INVALID_START_DATE),
    check('endDate')
      .isISO8601().withMessage((value, { req }) => req.validationMessages.INVALID_END_DATE)
      .custom((endDate, { req }) => {
        if (new Date(endDate) < new Date(req.body.startDate)) {
          throw new Error(req.validationMessages.INVALID_DATE_RANGE);
        }
        return true;
      }),
    check('budget')
      .isNumeric().withMessage((value, { req }) => req.validationMessages.INVALID_BUDGET),
    check('userId')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_USER_ID),
    check('transport')
      .isArray({ min: 1 }).withMessage((value, { req }) => req.validationMessages.REQUIRED_TRANSPORT)
      .custom((transport, { req }) => {
        transport.forEach(id => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(req.validationMessages.INVALID_TRANSPORT_ID);
          }
        });
        return true;
      }),
    check('destination')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_DESTINATION_ID),
    check('tripType')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_TRIP_TYPE_ID),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  tripController.createTrip
);


/**
 * @swagger
 * /trips/{id}:
 *   put:
 *     summary: Met à jour les détails d'un trip existant
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []  # Si vous utilisez JWT ou un autre mécanisme d'authentification par jeton
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du trip à mettre à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Le titre du trip
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: La date de début du trip (au format ISO 8601)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: La date de fin du trip (au format ISO 8601)
 *               budget:
 *                 type: number
 *                 description: Le budget estimé pour le trip
 *               transport:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: objectId
 *                 description: Liste des IDs des moyens de transport pour le trip
 *               destination:
 *                 type: string
 *                 format: objectId
 *                 description: ID de la destination du trip
 *               tripType:
 *                 type: string
 *                 format: objectId
 *                 description: ID du type de trip
 *     responses:
 *       200:
 *         description: Trip mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID du trip mis à jour
 *                 title:
 *                   type: string
 *                   description: Titre du trip
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   description: Date de début du trip
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   description: Date de fin du trip
 *                 budget:
 *                   type: number
 *                   description: Budget du trip
 *                 transport:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Liste des moyens de transport du trip
 *                 destination:
 *                   type: string
 *                   description: ID de la destination du trip
 *                 tripType:
 *                   type: string
 *                   description: ID du type de trip
 *                 groupId:
 *                   type: string
 *                   description: ID du groupe associé au trip
 *       400:
 *         description: Requête invalide (erreur de validation des champs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Message d'erreur
 *                       param:
 *                         type: string
 *                         description: Paramètre en erreur
 *                       location:
 *                         type: string
 *                         description: Emplacement du paramètre (ex. "body")
 *       404:
 *         description: Trip non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trip non trouvé.
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Une erreur est survenue lors de la mise à jour du trip.
 */
router.put(
  '/:id',
  authenticateToken,
  checkTripAdministrator,
  (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    req.validationMessages = messages[lang];
    next();
  },
  [
    check('title')
      .optional()
      .isString().withMessage((value, { req }) => req.validationMessages.INVALID_NAME),
    check('startDate')
      .optional()
      .isISO8601().withMessage((value, { req }) => req.validationMessages.INVALID_START_DATE),
    check('endDate')
      .optional()
      .isISO8601().withMessage((value, { req }) => req.validationMessages.INVALID_END_DATE)
      .custom((endDate, { req }) => {
        if (req.body.startDate && new Date(endDate) < new Date(req.body.startDate)) {
          throw new Error(req.validationMessages.INVALID_DATE_RANGE);
        }
        return true;
      }),
    check('budget')
      .optional()
      .isNumeric().withMessage((value, { req }) => req.validationMessages.INVALID_BUDGET),
    check('transport')
      .optional()
      .isArray({ min: 1 }).withMessage((value, { req }) => req.validationMessages.REQUIRED_TRANSPORT)
      .custom((transport, { req }) => {
        transport.forEach(id => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(req.validationMessages.INVALID_TRANSPORT_ID);
          }
        });
        return true;
      }),
    check('destination')
      .optional()
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_DESTINATION_ID),
    check('tripType')
      .optional()
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_TRIP_TYPE_ID),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  tripController.updateTrip
);

/**
 * @swagger
 * /trips/{id}:
 *   delete:
 *     summary: Supprime un trip existant ainsi que le groupe associé
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []  # Si vous utilisez JWT ou un autre mécanisme d'authentification par jeton
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du trip à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip et groupe associé supprimés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trip supprimé avec succès.
 *       400:
 *         description: Requête invalide (erreur de validation des champs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: Message d'erreur
 *                       param:
 *                         type: string
 *                         description: Paramètre en erreur
 *                       location:
 *                         type: string
 *                         description: Emplacement du paramètre (ex. "path")
 *       404:
 *         description: Trip non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trip non trouvé.
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Une erreur est survenue lors de la suppression du trip.
 */
router.delete(
  '/:id',
  authenticateToken,
  checkTripAdministrator,
  (req, res, next) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    req.validationMessages = messages[lang];
    next();
  },
  [
    check('id')
      .isMongoId().withMessage((value, { req }) => req.validationMessages.INVALID_TRIP_ID)
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  tripController.deleteTripById
);

module.exports = router;

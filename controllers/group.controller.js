const Group = require('../models/group.model'),
    Trip = require('../models/trip.model'),
    GroupMessage = require('../models/groupMessage.model'),
    User = require('../models/user.model'),
    languages = require('../models/language.model'),
    getLanguageFromHeaders = require('../utils/languageUtils'),
    messages = require('../utils/messages');


/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getGroupById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const groupId = req.params.groupId;
    try {
        const group = await Group.findById(groupId)
            .populate('members')
            .populate('administrator')
            .populate('languages');
        if (!group) {
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
        }
        res.json(group);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGroupsByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await Group.find({ members: userId })
            .populate('members')
            .populate('administrator')
            .populate('languages');

        res.json(groups);
    } catch (err) {
        console.error('Erreur lors de la récupération des groupes :', err);
        res.status(500).json({ message: err.message });
    }
};



/***
 * ---------------------------------------
 * POST
 * ---------------------------------------
 */
// exports.createGroup = async (req, res) => {
//     const { trip, name, members, administrator, languages } = req.body;

//     try {

//         const newGroup = new Group({
//             trip,
//             name,
//             members,
//             administrator,
//             languages
//         });

//         const savedGroup = await newGroup.save();
//         res.status(201).json(savedGroup);
//     } catch (err) {
//         res.status(500).json({ message: err.message })
//     }
// };

/***
 * ---------------------------------------
 * PUT
 * ---------------------------------------
 */

exports.addUserToGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const lang = getLanguageFromHeaders(req) || 'en';

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
        }

    
        if (group.members.includes(userId)) {
            return res.status(400).json({ message: messages[lang].USER_ALREADY_IN_GROUP });
        }

        
        group.members.push(userId);

        const updatedGroup = await group.save();

        res.json({ message: messages[lang].USER_ADDED_TO_GROUP_SUCCESS, group: updatedGroup });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



/**
 * -----------------------------------------------------
 * ADMINISTRATOR FUNCTIONS
 * ----------------------------------------------------- 
 **/

/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */
exports.deleteGroupById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const groupId = req.params.id;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
        }

        await GroupMessage.deleteMany({ group: groupId });

        await group.remove();

        res.json({ message: messages[lang].GROUP_AND_MESSAGES_DELETED });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};





exports.removeUserFromGroup = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { groupId, userId } = req.params;

    try {
        const group = await Group.findById(groupId);

        group.members = group.members.filter(member => member.toString() !== userId);

        const updatedGroup = await group.save();

        res.json({ message: messages[lang].USER_REMOVE_FROM_GROUP_SUCCESS, group: updatedGroup });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
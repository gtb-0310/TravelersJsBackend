const Group = require('../models/group.model'),
    Trip = require('../models/trip.model'),
    GroupMessage = require('../models/groupMessage.model'),
    User = require('../models/user.model'),
    Languages = require('../models/language.model'),
    GroupJoinRequests = require('../models/groupJoinRequest.model');
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

/**
 * -----------------------------------------------------
 * ADMINISTRATOR FUNCTIONS
 * ----------------------------------------------------- 
 **/


/***
 * ---------------------------------------
 * PUT
 * ---------------------------------------
 */
exports.dissolveGroupById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const groupId = req.params.id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
        }

        await GroupMessage.deleteMany({ groupId: groupId });
        await GroupJoinRequests.deleteMany({ groupId: groupId });

        group.members = [];
        group.languages = [];

        const admin = await User.findById(group.administrator);

        if (!admin) {
            return res.status(404).json({ message: messages[lang].ADMIN_NOT_FOUND });
        }

        group.members.push(admin._id);

        const adminLanguages = admin.languages || [];
        group.languages = [...new Set(adminLanguages)];

        await group.save();

        res.json({ message: messages[lang].GROUP_DISSOLVED_WITH_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */
exports.removeUserFromGroup = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { groupId, userId } = req.params;

    // console.log(userId);
    // console.log(groupId);

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
        }

        if (!group.members.includes(userId)) {
            return res.status(404).json({ message: messages[lang].USER_NOT_IN_GROUP });
        }

        group.members = group.members.filter(member => member.toString() !== userId);

        if (group.administrator.toString() === userId) {
            if (group.members.length > 0) {
                const newAdmin = group.members[0];
                group.administrator = newAdmin;

                const trip = await Trip.findOne({ groupId: groupId });
                if (trip) {
                    trip.userId = group.administrator;
                    await trip.save();
                }
            } else {
                return res.status(403).json({
                    message: messages[lang].LAST_MEMBER_LEAVING,
                    suggestion: messages[lang].SUGGEST_TRIP_DELETION,
                });
            }
        }

        const remainingMembers = await User.find({ _id: { $in: group.members } });

        group.languages = [...new Set(remainingMembers.flatMap(member => member.languages.map(lang => lang.toString())))];

        console.log('Group avant sauvegarde (sans doublons dans les langues) :', group);

        const updatedGroup = await group.save();

        res.json({ message: messages[lang].USER_REMOVE_FROM_GROUP_SUCCESS, group: updatedGroup });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

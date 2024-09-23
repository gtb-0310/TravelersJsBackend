const GroupJoinRequest = require('../models/groupJoinRequest.model'),
    Group = require('../models/group.model'),
    User = require('../models/user.model'),
    getLanguageFromHeaders = require('../utils/languageUtils'),
    messages = require('../utils/messages');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getJoinRequestsByUserId = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const userId = req.user.id;

    try {
        const joinRequests = await GroupJoinRequest.find({ userId })
            .populate('userId', 'firstName lastName age languages interests description');

        if (joinRequests.length === 0) {
            return res.status(404).json({ message: messages[lang].NO_JOIN_REQUEST_FOR_USER });
        }

        res.json(joinRequests);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


exports.getJoinRequestsByGroupId = async (req, res) => {

    const lang = getLanguageFromHeaders(req) || 'en';
    const { groupId } = req.params;

    try {
        const joinRequests = await GroupJoinRequest.find({ groupId }).populate(
            'userId', 'firstName lastName age languages interests description'
        );

        if(joinRequests.length === 0){
            return res.status(404).json({ message: messages[lang].JOIN_REQUEST_NOT_FOUND });
        }

        res.json(joinRequests);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};



/***
 * ---------------------------------------
 * POST
 * ---------------------------------------
 */
exports.askGroupJoinRequest = async (req, res) => {

    const lang = getLanguageFromHeaders(req) || 'en';
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        const group = await Group.findById(groupId);
        if (!group){
            return res.status(404).json({ message : messages[lang].GROUP_NOT_FOUND });
        }

        const adminId = group.administrator;

        const newJoinRequest = new GroupJoinRequest({
            groupId,
            userId,
            adminId,
            message: req.body.message || ''
        });

        await newJoinRequest.save();

        //Envoie de notification à l'administrateur du groupe
        //await sendNotificationToAdmin(adminId, userId, groupId);


        res.status(201).json({ message: messages[lang].REQUEST_SENT_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/***
 * ---------------------------------------
 * PUT
 * ---------------------------------------
 */
exports.approveGroupJoinRequest = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { requestId } = req.params;

    try {

        const joinRequest = await GroupJoinRequest.findById(requestId);

        if (!joinRequest) {
            return res.status(404).json({ message: messages[lang].REQUEST_NOT_FOUND });
        }

        const user = await User.findById(joinRequest.userId);
        const userLanguages = user.languages || [];

        await Group.findByIdAndUpdate(joinRequest.groupId, {
            $addToSet: {
                members: joinRequest.userId,
                languages: { $each: userLanguages }
            }
        });

        await GroupJoinRequest.findByIdAndDelete(requestId);

        res.status(200).json({ message: messages[lang].USER_ADD_WITH_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */
exports.deleteJoinRequestById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { id } = req.params;
    try {

        const joinRequest = await GroupJoinRequest.findByIdAndDelete(id);

        if(!joinRequest){
            return res.status(404).json({ message: messages[lang].ERROR_OCCURED });
        }

        res.json({ message: messages[lang].REQUEST_DELETED_WITH_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




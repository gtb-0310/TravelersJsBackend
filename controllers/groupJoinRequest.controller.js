const GroupJoinRequest = require('../models/groupJoinRequest.model'),
    GroupRequest = require('../models/groupJoinRequest.model'),
    Group = require('../models/group.model'),
    User = require('../models/user.model'),
    getLanguageFromHeaders = require('../utils/languageUtils'),
    messages = require('../utils/messages');

//ONLY FOR ADMINISTRATOR
exports.getJoinRequestsByGroupId = async (req, res) => {

    const lang = getLanguageFromHeaders(req) || 'en';
    const { groupId } = req.params;

    try {
        const joinRequests = await GroupRequest.find({ groupId }).populate(
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


exports.getJoinRequestsByUserId = async (req, res) => {

    const lang = getLanguageFromHeaders(req) || 'en';
    const { userId } = req.params;

    try {

        const joinRequests = await GroupRequest.find({ userId }).populate(
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


exports.askGroupJoinRequest = async (req, res) => {

    const lang = getLanguageFromHeaders(req) || 'en';
    const { groupId, userId, adminId } = req.params;

    try {
        const newJoinRequest = new GroupJoinRequest({
            groupId,
            userId,
            adminId,
            message: req.body.message || ''
        });

        await newJoinRequest.save();

        res.status(201).json({ message: messages[lang].REQUEST_SENT_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.approveGroupJoinRequest = async (req, res) => {

    const lang = getLanguageFromHeaders(req) || 'en';
    const { requestId } = req.params;

    try {

        const joinRequest = await GroupJoinRequest.findById(requestId);

        if (!joinRequest) {
            return res.status(404).json({ message: messages[lang].REQUEST_NOT_FOUND });
        }

        await Group.findByIdAndUpdate(joinRequest.groupId, {
            $addToSet: { members: joinRequest.userId }
        });

        await GroupJoinRequest.findByIdAndDelete(requestId);

        res.status(200).json({ message: messages[lang].REQUEST_APPROVED_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.deleteJoinRequestById = async (req, res) => {

    const lang = getLanguageFromHeaders(req) || 'en';
    const { id } = req.params;
    
    try {

        const joinRequest = await GroupRequest.findByIdAndDelete(id);

        if(!joinRequest){
            return res.status(404).json({ message: messages[lang].ERROR_OCCURED });
        }

        res.json({ message: messages[lang].SUCCESS });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




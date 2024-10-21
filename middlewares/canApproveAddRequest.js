const GroupJoinRequest = require('../models/groupJoinRequest.model');
const Group = require('../models/group.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');


async function canApproveAddRequest(req, res, next) {
  const lang = getLanguageFromHeaders(req) || 'en';
  const userId = req.user.id;
  const requestId = req.params.requestId;
  
  try {
    const joinRequest = await GroupJoinRequest.findById(requestId);
    if (!joinRequest) {
      return res.status(404).json({ message: messages[lang].ADD_REQUEST_NOT_FOUND });
    }

    const group = await Group.findById(joinRequest.groupId);
    if (!group) {
      return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
    }

    if (group.administrator.toString() !== userId) {
      return res.status(403).json({ message: messages[lang].NOT_ADMIN_DENIED_ACCESS });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: messages[lang].SERVER_ERROR});
  }
}

module.exports = canApproveAddRequest;

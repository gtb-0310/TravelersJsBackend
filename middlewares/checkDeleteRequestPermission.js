const GroupJoinRequest = require('../models/groupJoinRequest.model');
const Group = require('../models/group.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkDeleteRequestPermission(req, res, next) {
  const lang = getLanguageFromHeaders(req) || 'en';
  const userId = req.user.id;
  const requestId = req.params.id;

  try {
    const joinRequest = await GroupJoinRequest.findById(requestId);
    if (!joinRequest) {
      return res.status(404).json({ message: messages[lang].REQUEST_NOT_FOUND });
    }

    const group = await Group.findById(joinRequest.groupId);
    if (!group) {
      return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
    }

    const isAdmin = group.administrator.toString() === userId;
    const isRequestAuthor = joinRequest.userId.toString() === userId;

    if (!isAdmin && !isRequestAuthor) {
      return res.status(403).json({ message: messages[lang].NOT_ADMIN_DENIED_ACCESS });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = checkDeleteRequestPermission

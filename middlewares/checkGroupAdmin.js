const Group = require('../models/group.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkGroupAdmin(req, res, next) {
  const lang = getLanguageFromHeaders(req) || 'en';
  const userId = req.user.id;
  var groupId = req.params.id;

  if (!groupId) {
    groupId = req.params.groupId;
  }
  
  try {
    const group = await Group.findById(groupId);

    console.log(groupId);
    
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

module.exports = checkGroupAdmin;

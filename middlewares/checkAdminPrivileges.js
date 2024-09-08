const Group = require('../models/group.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

async function checkAdminPrivileges(req, res, next) {
  const lang = getLanguageFromHeaders(req) || 'en';
  const userId = req.user.id;
  const groupId = req.params.id;
  
  try {
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: messages[lang].GROUP_NOT_FOUND });
    }

    if (group.administrator.toString() !== userId) {
      return res.status(403).json({ message: messages[lang].NOT_ADMIN_DENIED_ACCESS });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = checkAdminPrivileges;

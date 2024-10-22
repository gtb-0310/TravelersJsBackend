const ReportedUser = require('../models/reportedUser.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');
const ReasonReporting = require('../models/reasonReporting.model');
const User = require('../models/user.model');

/***
 * ---------------------------------------
 * GET
 * ---------------------------------------
 */
exports.getAllReports = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';

    try {
        const reports = await ReportedUser.find()
            .populate('reportedUserId', 'firstName lastName email') 
            .populate('reportingUserId', 'firstName lastName email')
            .populate({
                path: 'reasonId',
                select: `reason.${lang}`,
            });
        
        if (reports.length === 0) {
            return res.status(404).json({ message: messages[lang].NO_REPORTS_FOUND });
        }

        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

exports.getReportingById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const reportingId = req.params.reportingId;

    try {
        const reporting = await ReportedUser.findById(reportingId)
            .populate('reportedUserId', 'firstName lastName email') 
            .populate('reportingUserId', 'firstName lastName email')
            .populate({
                path: 'reasonId',
                select: `reason.${lang}`,
            });

        if (!reporting) {
            return res.status(404).json({ message: messages[lang].NO_REPORTS_FOUND });
        }

        res.json(reporting);
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


/***
 * ---------------------------------------
 * POST
 * ---------------------------------------
 */
exports.createReport = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const reportingUserId = req.user.id;
    const reportedUserId = req.params.reportedUserId;
    const reasonId = req.params.reasonId;
    const { description, evidence } = req.body;

    try {
        const reason = await ReasonReporting.findById(reasonId);

        if(!reason){
            return res.status(404).json({ message: messages[lang].INVALID_REASON_ID });
        }

        const existingReport = await ReportedUser.findOne({
            reportingUserId,
            reportedUserId,
            reasonId
        });

        if (existingReport) {
            return res.status(400).json({ message: messages[lang].REPORT_ALREADY_EXISTS });
        }

        const newReport = new ReportedUser({
            reportingUserId,
            reportedUserId,
            reasonId,
            description,
            isVerified: false,
            evidence
        });

        const savedReport = await newReport.save();
        res.status(201).json({message: messages[lang].USER_REPORTED_WITH_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


/***
 * ---------------------------------------
 * PUT
 * ---------------------------------------
 */
exports.banishUser = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const reportId = req.params.reportId;

    try {

        const report = await ReportedUser.findById(reportId);

        if (!report) {
            return res.status(404).json({ message: messages[lang].REPORT_NOT_FOUND });
        }

        report.isVerified = true;
        await report.save();

        const reportedUserId = report.reportedUserId;

        const user = await User.findById(reportedUserId);

        if (!user) {
            return res.status(404).json({ message: messages[lang].USER_NOT_FOUND });
        }

        user.reportCount += 1;

        if (user.reportCount === 1) {
            user.isBanned = true;
            user.banTimeLapse = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await invalidateUserSession(user);
            await user.save();
            return res.status(200).json({ message: messages[lang].USER_BANNED_ONE_DAY_SUCCESSFULLY });
        } else if (user.reportCount === 2) {
            user.isBanned = true;
            user.banTimeLapse = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await invalidateUserSession(user);
            await user.save();
            return res.status(200).json({ message: messages[lang].USER_BANNED_ONE_WEEK_SUCCESSFULLY });
        } else if (user.reportCount >= 3) {
            user.isBanned = true;
            user.banTimeLapse = null;
            await deleteUser(reportedUserId, res, lang);
            return;
        }

    } catch (error) {
        res.status(500).json({ message: messages[lang].ERROR_OCCURED_DURING_REPORTING_VALIDATION });
    }
};





/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */
exports.deleteReportById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const reportId = req.params.reportId;

    try {
        const report = await ReportedUser.findByIdAndDelete(reportId);

        if (!report) {
            return res.status(404).json({ message: messages[lang].NO_REPORT_FOUND });
        }

        res.status(200).json({ message: messages[lang].REPORT_DELETED_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

/***
 * ---------------------------------------
 * ASYNC FUNCTION
 * ---------------------------------------
 */
async function deleteUser(reportedUserId, res, lang) {
    try {
        const userController = require('../controllers/user.controller');

        const fakeReq = {
            user: {
                id: reportedUserId
            },
            headers: {
                'accept-language': lang
            }
        };

        await userController.deleteUserProfil(fakeReq, res);
    } catch (error) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
}



async function invalidateUserSession(user) {
    try {
        await User.findByIdAndUpdate(user._id, { refreshToken: '' }, { new: true, runValidators: false });
    } catch (error) {
        console.error("Failed to invalidate user session:", error);
    }
};

const ReportedUser = require('../models/reportedUser.model');
const messages = require('../utils/messages');
const getLanguageFromHeaders = require('../utils/languageUtils');

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
            .populate('reportingUserId', 'firstName lastName email');
        
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
            .populate('reportingUserId', 'firstName lastName email');

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
    const { reportedUserId, reason } = req.body;

    try {
        const existingReport = await ReportedUser.findOne({
            reportingUserId,
            reportedUserId
        });

        if (existingReport) {
            return res.status(400).json({ message: messages[lang].REPORT_ALREADY_EXISTS });
        }

        const newReport = new ReportedUser({
            reportingUserId,
            reportedUserId,
            reason
        });

        const savedReport = await newReport.save();
        res.status(201).json({message: messages[lang].USER_REPORTED_WITH_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};


/***
 * ---------------------------------------
 * DELETE
 * ---------------------------------------
 */

exports.deleteReportById = async (req, res) => {
    const lang = getLanguageFromHeaders(req) || 'en';
    const { id } = req.params;

    try {
        const report = await ReportedUser.findByIdAndDelete(id);

        if (!report) {
            return res.status(404).json({ message: messages[lang].NO_REPORT_FOUND });
        }

        res.status(200).json({ message: messages[lang].REPORT_DELETED_SUCCESS });
    } catch (err) {
        res.status(500).json({ message: messages[lang].SERVER_ERROR });
    }
};

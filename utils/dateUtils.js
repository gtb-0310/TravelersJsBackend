function cleanDateFromHours(date){
    const cleanedDate = new Date(date);
    cleanedDate.setUTCHours(0,0,0,0);
    return cleanedDate;
}

function startOfDay(date) {
    const cleanedDate = new Date(date);
    cleanedDate.setUTCHours(0,0,0,0);
    return cleanedDate;
}

function endOfDay(date) {
    const cleanedDate = new Date(date);
    cleanedDate.setUTCHours(23, 59, 59, 999);
    return cleanedDate;
}


module.exports = {
    cleanDateFromHours,
    startOfDay,
    endOfDay
};
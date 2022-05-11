// 筛选范围日期内的数据
export const getFilterDateLogger = (db, start = 0, end = Date.now()) => {
    return db.where('timeStamp').between(start, end, true, true);
}

// 日付を日本風にフォーマット（2025/7/16(水)）
export const formatDateJapanese = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${year}/${month}/${day}(${dayOfWeek})`;
};

// 曜日を日本語に変換
export const getDayOfWeekJapanese = (dayOfWeekEng) => {
    const dayMap = {
        'Mon': '月',
        'Tue': '火', 
        'Wed': '水',
        'Thu': '木',
        'Fri': '金',
        'Sat': '土',
        'Sun': '日'
    };
    return dayMap[dayOfWeekEng] || dayOfWeekEng;
};

// 短縮日付フォーマット（7/16）
export const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
};

// 場所名を日本語で表示
export const getLocationDisplayName = (location) => {
    const locationMap = {
        'omotesando': '表参道',
        'yottekan': 'よって館しもちょう',
        'honmachi4': '本町4丁目商店街',
        'honmachi3': '本町3丁目商店街',
        'honmachi2': '本町2丁目商店街',
        'kokubunjidori': '国分寺通り 第二商店街',
        'yasukawadori': 'やすかわ通り商店街',
        'jinnya': '高山陣屋前交差点',
        'nakabashi': '中橋',
        'old-town': '古い町並',
        'station': '駅前',
        'gyouzinbashi': '行神橋'
    };
    return locationMap[location] || location;
};

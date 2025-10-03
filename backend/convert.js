const readline = require('readline');

// Tạo interface để đọc input từ bàn phím
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Hàm chuyển đổi tiếng Việt có dấu thành không dấu
function removeVietnameseDiacritics(str) {
    const diacriticsMap = {
        'a': 'áàảãạâấầẩẫậăắằẳẵặ',
        'e': 'éèẻẽẹêếềểễệ',
        'i': 'íìỉĩị',
        'o': 'óòỏõọôốồổỗộơớờởỡợ',
        'u': 'úùủũụưứừửữự',
        'y': 'ýỳỷỹỵ',
        'd': 'đ',
        'A': 'ÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶ',
        'E': 'ÉÈẺẼẸÊẾỀỂỄỆ',
        'I': 'ÍÌỈĨỊ',
        'O': 'ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ',
        'U': 'ÚÙỦŨỤƯỨỪỬỮỰ',
        'Y': 'ÝỲỶỸỴ',
        'D': 'Đ'
    };

    let result = str;
    for (const [normalChar, diacriticChars] of Object.entries(diacriticsMap)) {
        for (const diacriticChar of diacriticChars) {
            result = result.replace(new RegExp(diacriticChar, 'g'), normalChar);
        }
    }

    return result;
}

// Hàm chuyển đổi chuỗi thành slug (không dấu, nối bằng _)
function convertToSlug(str) {
    // Loại bỏ dấu tiếng Việt
    let result = removeVietnameseDiacritics(str);

    // Chuyển thành chữ thường
    result = result.toLowerCase();

    // Thay thế khoảng trắng và ký tự đặc biệt bằng _
    result = result.replace(/[^a-z0-9]/g, '_');

    // Loại bỏ nhiều _ liên tiếp
    result = result.replace(/_+/g, '_');

    // Loại bỏ _ ở đầu và cuối
    result = result.replace(/^_+|_+$/g, '');

    return result;
}

console.log('=== CHUYỂN ĐỔI TIẾNG VIỆT THÀNH SLUG ===');
console.log('Nhập văn bản (Enter để xử lý, Ctrl+C để thoát):');

rl.on('line', (input) => {
    if (input.trim() === '') {
        console.log('Vui lòng nhập văn bản...');
        return;
    }

    const result = convertToSlug(input.trim());

    console.log('─'.repeat(50));
    console.log(`Input:  "${input}"`);
    console.log(`Output: "${result}"`);
    console.log('─'.repeat(50));
    console.log('Nhập tiếp văn bản khác:');
});

rl.on('close', () => {
    console.log('\nCảm ơn bạn đã sử dụng!');
    process.exit(0);
});

// Test cases để kiểm tra
console.log('\n=== VÍ DỤ ===');
const testCases = [
    'Xin chào Việt Nam',
    'Tôi là sinh viên đại học',
    'Công nghệ thông tin 2024',
    'Phát triển ứng dụng mobile'
];

testCases.forEach(test => {
    console.log(`"${test}" → "${convertToSlug(test)}"`);
});
console.log('\n');

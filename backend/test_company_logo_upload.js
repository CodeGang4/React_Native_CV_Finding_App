const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

async function testCompanyLogoUpload() {
    console.log('🧪 Testing Company Logo Upload Functionality\n');

    // Test với một company ID (giả sử đã có trong database)
    const testCompanyId = 'test-company-id'; // Thay bằng company ID thực tế
    
    try {
        // Tạo một file test image đơn giản
        const testImageContent = Buffer.from('fake-image-content-for-testing');
        const testFileName = 'test-company-logo.png';
        
        // Tạo FormData
        const formData = new FormData();
        formData.append('companyLogo', testImageContent, {
            filename: testFileName,
            contentType: 'image/png'
        });

        console.log(`📤 Uploading logo for company: ${testCompanyId}`);
        console.log(`📁 Test file: ${testFileName}`);

        // Gọi API upload
        const response = await axios.post(
            `${BASE_URL}/employer/${testCompanyId}/upload-logo`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Type': 'multipart/form-data'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log('✅ Upload response:', {
            status: response.status,
            logo_url: response.data.logo_url,
            message: response.data.message,
            updated_data: response.data.updated_data
        });

        // Verify bằng cách get company info
        console.log('\n🔍 Verifying upload by fetching company info...');
        const verifyResponse = await axios.get(`${BASE_URL}/employer/${testCompanyId}`);
        
        console.log('✅ Verification result:', {
            company_name: verifyResponse.data.company_name,
            company_logo: verifyResponse.data.company_logo,
            logo_updated: verifyResponse.data.company_logo !== null
        });

    } catch (error) {
        if (error.response) {
            console.error('❌ Upload failed:', {
                status: error.response.status,
                error: error.response.data.error,
                details: error.response.data.details
            });
        } else {
            console.error('❌ Request failed:', error.message);
        }
    }
}

async function testErrorCases() {
    console.log('\n🧪 Testing Error Cases\n');
    
    const testCompanyId = 'test-company-id';

    // Test 1: Upload without file
    console.log('1️⃣ Testing upload without file...');
    try {
        const formData = new FormData();
        // Không thêm file
        
        const response = await axios.post(
            `${BASE_URL}/employer/${testCompanyId}/upload-logo`,
            formData,
            {
                headers: formData.getHeaders()
            }
        );
        console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
        console.log('✅ Correctly rejected upload without file:', {
            status: error.response?.status,
            error: error.response?.data?.error
        });
    }

    // Test 2: Upload with invalid company ID
    console.log('\n2️⃣ Testing upload with non-existent company ID...');
    try {
        const formData = new FormData();
        const testImageContent = Buffer.from('fake-image-content');
        formData.append('companyLogo', testImageContent, {
            filename: 'test.png',
            contentType: 'image/png'
        });
        
        const response = await axios.post(
            `${BASE_URL}/employer/non-existent-company-id/upload-logo`,
            formData,
            {
                headers: formData.getHeaders()
            }
        );
        console.log('❌ Should have failed but succeeded:', response.data);
    } catch (error) {
        console.log('✅ Correctly rejected invalid company ID:', {
            status: error.response?.status,
            error: error.response?.data?.error
        });
    }
}

// Chạy tests
console.log('🚀 Starting Company Logo Upload Tests...\n');

testCompanyLogoUpload()
    .then(() => testErrorCases())
    .then(() => console.log('\n🎯 Company Logo Upload Tests Complete!'))
    .catch(console.error);
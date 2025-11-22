const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../supabase/config');

class ChatbotService {
    constructor() {
        // Use fallback analysis only (AI APIs have quota/availability issues)
        this.useAI = false;
    }

    /**
     * Expand job title to related keywords for better matching
     */
    expandJobTitleKeywords(jobTitle) {
        const expansionMap = {
            'tester': ['tester', 'qa', 'quality assurance', 'test engineer', 'qa engineer', 'quality engineer'],
            'qa tester': ['tester', 'qa', 'quality assurance', 'test engineer', 'qa engineer'],
            'qa engineer': ['tester', 'qa', 'quality assurance', 'test engineer', 'qa engineer'],
            'frontend': ['frontend', 'front-end', 'front end', 'fe developer', 'reactjs', 'vuejs', 'angular'],
            'frontend developer': ['frontend', 'front-end', 'front end', 'fe developer', 'reactjs', 'vuejs', 'angular'],
            'backend': ['backend', 'back-end', 'back end', 'be developer', 'java', 'nodejs', 'python', '.net'],
            'backend developer': ['backend', 'back-end', 'back end', 'be developer', 'java', 'nodejs', 'python', '.net'],
            'fullstack': ['fullstack', 'full-stack', 'full stack', 'fullstack developer'],
            'fullstack developer': ['fullstack', 'full-stack', 'full stack'],
            'mobile developer': ['mobile', 'ios', 'android', 'react native', 'flutter'],
            'devops': ['devops', 'dev ops', 'infrastructure', 'cloud engineer', 'sre'],
            'data analyst': ['data analyst', 'data', 'analyst', 'business intelligence', 'bi'],
            'data scientist': ['data scientist', 'machine learning', 'ai', 'data science'],
            'ui/ux designer': ['ui/ux', 'ux', 'ui', 'designer', 'product designer', 'user experience'],
            'product manager': ['product manager', 'pm', 'product owner', 'po'],
            'project manager': ['project manager', 'pm', 'scrum master', 'agile']
        };
        
        const lowerTitle = jobTitle.toLowerCase().trim();
        
        // Return expanded keywords if exists, otherwise return the original keyword
        return expansionMap[lowerTitle] || [lowerTitle];
    }

    /**
     * Get job listings from database
     */
    async getJobs(filters = {}) {
        try {
            let query = supabase
                .from('jobs')
                .select(`
                    *,
                    employers (
                        id,
                        company_name,
                        company_logo,
                        industry,
                        company_website
                    )
                `)
                .eq('is_expired', false);

            // Apply database filters (only for fields that exist in jobs table)
            if (filters.requirements) {
                query = query.ilike('requirements', `%${filters.requirements}%`);
            }

            const { data, error } = await query.limit(100); // Get more results for filtering

            if (error) throw error;
            
            let jobs = data || [];
            
            // Filter by location (client-side for better matching)
            if (filters.location) {
                jobs = jobs.filter(job => {
                    if (!job.location) return false;
                    
                    const locationLower = job.location.toLowerCase();
                    const searchLocation = filters.location.toLowerCase();
                    
                    // Split location by comma to check each part
                    const locationParts = locationLower.split(',').map(part => part.trim());
                    
                    // Check if search location matches any part
                    return locationParts.some(part => {
                        // Exact match or contains (for districts/areas)
                        return part === searchLocation || 
                               part.includes(searchLocation) ||
                               searchLocation.includes(part);
                    });
                });
            }

            // Client-side filters (more flexible matching)
            
            // Filter by job title with expanded keywords
            if (filters.jobTitle) {
                const searchKeywords = this.expandJobTitleKeywords(filters.jobTitle);
                jobs = jobs.filter(job => {
                    const title = (job.title || '').toLowerCase();
                    const position = (job.position || '').toLowerCase();
                    const requirements = (job.requirements || '').toLowerCase();
                    
                    // Check if any keyword matches in title, position, or requirements
                    return searchKeywords.some(keyword => 
                        title.includes(keyword) || 
                        position.includes(keyword) ||
                        requirements.includes(keyword)
                    );
                });
            }
            
            // Filter by industry
            if (filters.industry) {
                jobs = jobs.filter(job => {
                    const position = (job.position || '').toLowerCase();
                    return position.includes(filters.industry.toLowerCase());
                });
            }
            
            // Filter by company name (nested field)
            if (filters.companyName) {
                jobs = jobs.filter(job => {
                    const companyName = job.employers?.company_name || '';
                    return companyName.toLowerCase().includes(filters.companyName.toLowerCase());
                });
            }
            
            // Filter by salary (text field)
            if (filters.minSalary || filters.maxSalary) {
                jobs = jobs.filter(job => {
                    if (!job.salary) return false;
                    
                    // Extract numbers from salary text (e.g., "15-20 triệu", "30 triệu", "Negotiable")
                    const salaryNumbers = job.salary.match(/\d+/g);
                    if (!salaryNumbers) return false;
                    
                    // Get the first number as min salary in the range
                    const jobMinSalary = parseInt(salaryNumbers[0]) * 1000000;
                    
                    // Check against filters
                    if (filters.minSalary && jobMinSalary < filters.minSalary) {
                        return false;
                    }
                    if (filters.maxSalary && jobMinSalary > filters.maxSalary) {
                        return false;
                    }
                    
                    return true;
                });
            }

            return jobs.slice(0, 10); // Return top 10 results
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    }

    /**
     * Get company information
     */
    async getCompanies(filters = {}) {
        try {
            let query = supabase
                .from('employers')
                .select(`
                    *,
                    jobs!inner (
                        id,
                        title,
                        is_expired
                    )
                `)
                .eq('jobs.is_expired', false);

            if (filters.industry) {
                query = query.ilike('industry', `%${filters.industry}%`);
            }
            if (filters.companyName) {
                query = query.ilike('company_name', `%${filters.companyName}%`);
            }

            const { data, error } = await query.limit(10);

            if (error) throw error;

            // Group jobs by company
            const companies = {};
            data?.forEach(row => {
                if (!companies[row.id]) {
                    companies[row.id] = {
                        id: row.id,
                        name: row.company_name,
                        logo: row.company_logo,
                        industry: row.industry,
                        website: row.company_website,
                        description: row.description,
                        jobs: []
                    };
                }
                if (row.jobs) {
                    companies[row.id].jobs.push(row.jobs);
                }
            });

            return Object.values(companies);
        } catch (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
    }

    /**
     * Extract intent and entities from user message
     */
    async analyzeMessage(message) {
        console.log('🤖 Analyzing message:', message);
        return this.fallbackAnalyze(message);
    }

    /**
     * Fallback analysis without AI
     */
    fallbackAnalyze(message) {
        const lowerMessage = message.toLowerCase();
        const entities = {};
        let intent = 'general';

        // Detect intent - check for job-related keywords
        if (lowerMessage.includes('tìm việc') || lowerMessage.includes('việc làm') || 
            lowerMessage.includes('tuyển dụng') || lowerMessage.includes('job') ||
            lowerMessage.includes('công việc') || lowerMessage.includes('vị trí') ||
            lowerMessage.includes('lương') || lowerMessage.includes('salary') ||
            lowerMessage.includes('yêu cầu')) {
            intent = 'find_job';
        } else if (lowerMessage.includes('công ty') || lowerMessage.includes('company')) {
            intent = 'find_company';
        }

        // Extract location - check specific districts/areas first, then cities
        const locationPatterns = [
            // Hanoi districts
            'cầu giấy', 'hoàn kiếm', 'ba đình', 'đống đa', 'hai bà trưng', 'thanh xuân',
            'tây hồ', 'long biên', 'nam từ liêm', 'bắc từ liêm', 'hà đông', 'hoàng mai',
            // HCMC districts
            'quận 1', 'quận 2', 'quận 3', 'quận 4', 'quận 5', 'quận 7', 'quận 10',
            'bình thạnh', 'phú nhuận', 'thủ đức', 'gò vấp', 'tân bình',
            // Cities
            'hà nội', 'hồ chí minh', 'đà nẵng', 'cần thơ', 'hải phòng', 'nha trang', 'huế'
        ];
        
        for (const loc of locationPatterns) {
            if (lowerMessage.includes(loc)) {
                entities.location = loc.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                break;
            }
        }

        // Extract job title (specific job roles) - check for single words too
        const jobTitles = [
            'frontend developer', 'frontend', 'front-end',
            'backend developer', 'backend', 'back-end',
            'fullstack developer', 'fullstack', 'full stack', 'full-stack',
            'mobile developer', 'ios developer', 'android developer', 'react native',
            'devops', 'data analyst', 'data scientist', 
            'ui/ux designer', 'ux designer', 'ui designer',
            'product manager', 'project manager', 'scrum master', 
            'qa engineer', 'qa tester', 'tester', 'software tester', 'automation tester', 'manual tester',
            'business analyst', 'sales executive', 'marketing manager', 'hr manager',
            'accountant', 'content writer', 'graphic designer', 'software engineer',
            'java developer', 'python developer', 'nodejs developer', '.net developer'
        ];
        
        for (const title of jobTitles) {
            if (lowerMessage.includes(title)) {
                entities.jobTitle = title;
                intent = 'find_job'; // Force job search intent if job title found
                break;
            }
        }
        
        // Extract technology requirements (React, Java, Python, etc.)
        const techKeywords = [
            'react', 'reactjs', 'react.js', 'react native',
            'angular', 'vue', 'vuejs', 'vue.js',
            'java', 'python', 'javascript', 'typescript',
            'nodejs', 'node.js', 'express',
            'spring boot', 'django', 'flask',
            '.net', 'c#', 'php', 'laravel',
            'flutter', 'kotlin', 'swift', 'ios', 'android'
        ];
        
        for (const tech of techKeywords) {
            if (lowerMessage.includes(tech)) {
                entities.requirements = tech;
                intent = 'find_job';
                break;
            }
        }
        
        // Extract company name - common Vietnamese companies
        const companies = [
            'fpt', 'viettel', 'vnpt', 'momo', 'tiki', 'shopee', 'lazada',
            'vingroup', 'vng', 'being', 'bkav', 'phenikaa', 'samsung',
            'lg', 'panasonic', 'honda', 'toyota', 'grab', 'gojek'
        ];
        
        for (const company of companies) {
            if (lowerMessage.includes(company)) {
                entities.companyName = company;
                intent = 'find_job'; // Search jobs at this company
                break;
            }
        }
        
        // Extract industry (broader categories)
        const industries = ['it', 'marketing', 'kế toán', 'nhân sự', 'kinh doanh', 'design', 'sales'];
        for (const industry of industries) {
            if (lowerMessage.includes(industry) && !entities.jobTitle) {
                entities.industry = industry.toUpperCase();
                break;
            }
        }

        // Extract salary - handle various formats
        // Format 1: "30 triệu trở lên" / "30 triệu+" / "trên 30 triệu"
        const minSalaryMatch = lowerMessage.match(/(?:lương|salary)?\s*(\d+)\s*triệu\s*(?:trở lên|\+|trở lên|trở lên|above|up)/i) ||
                              lowerMessage.match(/(?:trên|over|>\s*)(\d+)\s*triệu/i);
        if (minSalaryMatch) {
            entities.minSalary = parseInt(minSalaryMatch[1]) * 1000000;
        }
        
        // Format 2: "dưới 20 triệu" / "20 triệu trở xuống"
        const maxSalaryMatch = lowerMessage.match(/(?:dưới|under|<\s*)(\d+)\s*triệu/i) ||
                              lowerMessage.match(/(\d+)\s*triệu\s*(?:trở xuống|down)/i);
        if (maxSalaryMatch) {
            entities.maxSalary = parseInt(maxSalaryMatch[1]) * 1000000;
        }
        
        // Format 3: "15-20 triệu" / "15 đến 20 triệu"
        const rangeSalaryMatch = lowerMessage.match(/(\d+)\s*(?:đến|->|-|tới|to)\s*(\d+)\s*triệu/i);
        if (rangeSalaryMatch) {
            entities.minSalary = parseInt(rangeSalaryMatch[1]) * 1000000;
            entities.maxSalary = parseInt(rangeSalaryMatch[2]) * 1000000;
        }

        // Extract experience
        const expMatch = lowerMessage.match(/(\d+)\s*năm/i);
        if (expMatch) {
            entities.experience = `${expMatch[1]} năm`;
        }

        // Extract company name
        const companyMatch = lowerMessage.match(/công ty\s+([a-zA-Z0-9\s]+)/i);
        if (companyMatch) {
            entities.companyName = companyMatch[1].trim();
        }

        console.log('📊 Fallback analyzed:', { intent, entities });
        return { intent, entities };
    }

    /**
     * Generate response
     */
    async generateResponse(message, context = {}) {
        return this.fallbackResponse(context);
    }

    /**
     * Fallback response without AI
     */
    fallbackResponse(context) {
        const { jobs, companies, intent, entities = {} } = context;

        if (intent === 'find_job') {
            if (jobs && jobs.length > 0) {
                let response = `Tôi đã tìm thấy ${jobs.length} công việc phù hợp`;
                
                // Add criteria info
                const criteria = [];
                if (entities.jobTitle) {
                    criteria.push(`vị trí ${entities.jobTitle}`);
                }
                if (entities.requirements) {
                    criteria.push(`yêu cầu ${entities.requirements}`);
                }
                if (entities.companyName) {
                    criteria.push(`tại công ty ${entities.companyName}`);
                }
                if (entities.minSalary) {
                    criteria.push(`lương từ ${entities.minSalary / 1000000} triệu trở lên`);
                }
                if (entities.maxSalary && !entities.minSalary) {
                    criteria.push(`lương dưới ${entities.maxSalary / 1000000} triệu`);
                }
                if (entities.location) {
                    criteria.push(`tại ${entities.location}`);
                }
                if (entities.industry && !entities.jobTitle && !entities.requirements) {
                    criteria.push(`ngành ${entities.industry}`);
                }
                
                if (criteria.length > 0) {
                    response += ` cho ${criteria.join(', ')}`;
                }
                response += ':\n\n';
                
                // Format jobs as: Company Name - Job Title - Location
                jobs.slice(0, 5).forEach((job, index) => {
                    const companyName = job.employers?.company_name || 'Công ty';
                    const jobTitle = job.title || 'N/A';
                    const location = job.location || 'N/A';
                    response += `${index + 1}. ${companyName} - ${jobTitle} - ${location}\n`;
                });
                
                return response;
            } else {
                let response = 'Rất tiếc, hiện chưa có công việc phù hợp';
                
                // Mention what they were looking for
                const criteria = [];
                if (entities.jobTitle) {
                    criteria.push(`vị trí ${entities.jobTitle}`);
                }
                if (entities.minSalary) {
                    criteria.push(`lương từ ${entities.minSalary / 1000000} triệu trở lên`);
                }
                if (entities.location) {
                    criteria.push(`tại ${entities.location}`);
                }
                
                if (criteria.length > 0) {
                    response += ` cho ${criteria.join(', ')}`;
                }
                
                return response + '. Bạn có thể thử điều chỉnh địa điểm, mức lương hoặc vị trí công việc nhé!';
            }
        } else if (intent === 'find_company') {
            if (companies && companies.length > 0) {
                let response = `Tôi tìm thấy ${companies.length} công ty cho bạn:\n\n`;
                companies.slice(0, 5).forEach((company, index) => {
                    response += `${index + 1}. ${company.name} - ${company.industry || 'N/A'}\n`;
                });
                return response;
            } else {
                return 'Hiện chưa có thông tin về công ty này. Bạn muốn tìm công ty nào khác không?';
            }
        }

        return 'Xin chào! Tôi có thể giúp bạn tìm việc làm hoặc thông tin công ty. Ví dụ: "Tìm việc frontend developer ở Hà Nội" hoặc "Công ty FPT đang tuyển gì?"';
    }

    /**
     * Main chat method
     */
    async chat(message, userId = null) {
        try {
            console.log('📨 Chatbot received message:', message);

            // Analyze user intent
            const analysis = await this.analyzeMessage(message);
            console.log('🎯 Intent analysis:', analysis);

            let jobs = [];
            let companies = [];

            // Fetch relevant data based on intent
            if (analysis.intent === 'find_job') {
                jobs = await this.getJobs(analysis.entities);
                console.log('💼 Found jobs:', jobs.length);
            } else if (analysis.intent === 'find_company') {
                companies = await this.getCompanies(analysis.entities);
                console.log('🏢 Found companies:', companies.length);
            }

            // Generate AI response
            const response = await this.generateResponse(message, {
                jobs,
                companies,
                intent: analysis.intent,
                entities: analysis.entities
            });

            console.log('✅ Generated response');

            return {
                message: response,
                intent: analysis.intent,
                data: {
                    jobs: jobs.slice(0, 5), // Limit to 5 results
                    companies: companies.slice(0, 5)
                }
            };
        } catch (error) {
            console.error('❌ Chatbot error:', error);
            throw error;
        }
    }
}

module.exports = new ChatbotService();

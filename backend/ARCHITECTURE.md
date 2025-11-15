# Clean Architecture - Podcast Module

## Cấu trúc các Layer:

```
src/
├── Cache/                      # Cache Layer
│   └── ClientCache/
│       └── Podcast.cache.js    # Redis caching operations
│
├── repositories/               # Repository Layer (Data Access)
│   └── ClientRepositories/
│       └── Podcast.repository.js  # Database operations
│
├── services/                   # Service Layer (Business Logic)
│   └── ClientServices/
│       └── Podcast.service.js  # Business logic & orchestration
│
├── controllers/                # Controller Layer (HTTP)
│   └── ClientControllers/
│       └── PodcastController.js   # HTTP request handling
│
├── routes/                     # Routes Layer
│   └── ClientRoutes/
│       └── PodcastRouter.js    # Route definitions
│
└── utils/                      # Utilities
    ├── errorHandler.js         # Error handling utilities
    ├── response.js             # Response formatting utilities
    ├── validation.js           # Validation utilities
    └── index.js                # Central export point
```

## Luồng xử lý (Data Flow):

```
Client Request
    ↓
Route (PodcastRouter.js)
    ↓
Controller (PodcastController.js) - Validates request, formats response
    ↓
Service (Podcast.service.js) - Business logic, cache orchestration
    ↓         ↓
Cache     Repository (Podcast.repository.js) - Database operations
    ↓         ↓
Redis   Supabase
```

## Trách nhiệm từng Layer:

### 1. **Controller Layer** (`PodcastController.js`)
- Xử lý HTTP requests/responses
- Validate input từ request
- Format response trả về client
- **KHÔNG** chứa business logic

### 2. **Service Layer** (`Podcast.service.js`)
- Chứa business logic
- Orchestrate data flow giữa cache và repository
- Validate business rules
- Error handling

### 3. **Repository Layer** (`Podcast.repository.js`)
- Tương tác trực tiếp với database (Supabase)
- CRUD operations
- Database queries
- **KHÔNG** chứa business logic

### 4. **Cache Layer** (`Podcast.cache.js`)
- Tương tác với Redis
- Cache operations (get, set, delete)
- TTL management

### 5. **Utils Layer**
- **errorHandler.js**: Custom error classes, error middleware
- **response.js**: Standardized API response formats
- **validation.js**: Reusable validation functions

## API Endpoints:

```
GET    /api/podcasts              # Get all podcasts
GET    /api/podcasts/:id          # Get podcast by ID
GET    /api/podcasts/search?q=... # Search podcasts
POST   /api/podcasts              # Create new podcast
PUT    /api/podcasts/:id          # Update podcast
DELETE /api/podcasts/:id          # Delete podcast
```

## Ưu điểm của Clean Architecture:

1. **Separation of Concerns**: Mỗi layer có trách nhiệm riêng biệt
2. **Testability**: Dễ dàng unit test từng layer
3. **Maintainability**: Dễ bảo trì và mở rộng
4. **Scalability**: Dễ scale và thêm features mới
5. **Reusability**: Code có thể tái sử dụng
6. **Independence**: Các layer độc lập với nhau

## Ví dụ sử dụng:

### Trong Controller:
```javascript
getAllPodcasts = asyncHandler(async (req, res) => {
    const podcasts = await PodcastService.getAllPodcasts();
    return sendSuccess(res, podcasts, 'Podcasts retrieved successfully');
});
```

### Trong Service:
```javascript
async getAllPodcasts() {
    // Try cache first
    let podcasts = await PodcastCache.getAllPodcastsCache();
    if (podcasts) return podcasts;
    
    // Cache miss: Get from repository
    const { data, error } = await PodcastRepository.findAll();
    if (error) throw new AppError("Failed to fetch podcasts", 500);
    
    // Cache the result
    await PodcastCache.setAllPodcastsCache(data);
    return data;
}
```

### Error Handling:
```javascript
// Service throws AppError
throw new AppError("Podcast not found", 404);

// Controller wraps with asyncHandler
// Middleware catches and formats error response
```

const redis = require('../../redis/config');
const { AppError } = require('../../utils/errorHandler');
const AddressRepository = require('../../repositories/EmployerRepositories/Address.repository');
const supabase = require('../../supabase/config');

class AddressService {
    /**
     * Find jobs within radius from user location
     * @param {number} userLat - User's latitude
     * @param {number} userLon - User's longitude
     * @param {number} radiusKm - Search radius in kilometers (default: 5km)
     * @returns {Promise<Array>} Jobs sorted by distance
     */
    async findJobsByRadius(userLat, userLon, radiusKm = 5) {
        try {
            // Validate inputs
            if (!userLat || !userLon) {
                throw new AppError('User latitude and longitude are required', 400);
            }

            if (isNaN(userLat) || isNaN(userLon)) {
                throw new AppError('Invalid coordinates', 400);
            }

            if (radiusKm <= 0 || radiusKm > 100) {
                throw new AppError('Radius must be between 1 and 100 km', 400);
            }

            // Check cache
            const cacheKey = `jobs_nearby:${userLat}:${userLon}:${radiusKm}`;
            const cachedJobs = await redis.get(cacheKey);
            
            if (cachedJobs) {
                console.log('Jobs found in cache');
                return JSON.parse(cachedJobs);
            }

            // Get jobs from repository
            const jobs = await AddressRepository.findJobsWithinRadius(
                parseFloat(userLat),
                parseFloat(userLon),
                parseFloat(radiusKm)
            );

            // Cache for 10 minutes
            if (jobs.length > 0) {
                await redis.setEx(cacheKey, 600, JSON.stringify(jobs));
            }

            return jobs;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            console.error('Find jobs by radius error:', error.message);
            throw new AppError(`Failed to find jobs: ${error.message}`, 500);
        }
    }

    /**
     * Geocode address for a job
     */
    async geocodeAddress(job_id) {
        try {
            if (!job_id) {
                throw new AppError('Job ID is required', 400);
            }

            // Check cache first
            const cachedAddress = await redis.get(`job_address:${job_id}`);
            if (cachedAddress) {
                console.log('Address found in cache for job:', job_id);
                return JSON.parse(cachedAddress);
            }

            // Check if already geocoded
            const isGeocoded = await AddressRepository.isAddressGeocoded(job_id);
            if (isGeocoded) {
                console.log(`Job ${job_id} already geocoded, retrieving from database`);
                const { data } = await supabase
                    .from("job_address")
                    .select("latitude, longitude, location")
                    .eq("job_id", job_id)
                    .single();

                const result = {
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    address: data.location,
                    message: "Address already geocoded",
                };

                // Cache the result
                await redis.setEx(
                    `job_address:${job_id}`,
                    3600,
                    JSON.stringify(result)
                );

                return result;
            }

            // Get address from database
            const address = await AddressRepository.getAddressByJobId(job_id);

            // Geocode address with fallback strategies
            const geocodeResult = await AddressRepository.geocodeAddress(address);

            // If geocoding failed after all strategies, use default coordinates
            if (!geocodeResult) {
                console.log(`Geocoding failed for ${address}, using default coordinates`);
                
                // Default to Hanoi center
                const defaultLat = 21.0285;
                const defaultLon = 105.8542;

                await AddressRepository.saveGeocodedAddress(
                    job_id,
                    defaultLat,
                    defaultLon
                );

                const result = {
                    latitude: defaultLat,
                    longitude: defaultLon,
                    location: address,
                    display_name: "Hà Nội, Việt Nam (default)",
                    message: "Used default coordinates (geocoding failed)",
                    warning: true,
                };

                // Cache the result
                await redis.setEx(
                    `job_address:${job_id}`,
                    3600,
                    JSON.stringify(result)
                );

                return result;
            }

            // Save to database
            await AddressRepository.saveGeocodedAddress(
                job_id,
                geocodeResult.latitude,
                geocodeResult.longitude
            );

            console.log(`Successfully geocoded job ${job_id}`);

            const result = {
                latitude: geocodeResult.latitude,
                longitude: geocodeResult.longitude,
                address: geocodeResult.original_address,
                display_name: geocodeResult.display_name,
                message: "Address geocoded successfully",
            };

            // Cache the result
            await redis.setEx(
                `job_address:${job_id}`,
                3600,
                JSON.stringify(result)
            );

            return result;
        } catch (error) {
            console.error('Geocode address error:', error.message);
            
            // Pass through AppError
            if (error instanceof AppError) {
                throw error;
            }
            
            // Wrap other errors
            throw new AppError(
                `Failed to geocode address: ${error.message}`,
                500
            );
        }
    }

    async getAddressById(job_id) {
        try {
            const addressCache = await redis.get(`job_address:${job_id}`);
            if (addressCache) {
                return JSON.parse(addressCache);
            }
            const addressData = await AddressRepository.getAddressByJobId(job_id);
            if(!addressData) {
                await redis.setEx(
                    `job_address:${job_id}`,
                    3600,
                    JSON.stringify(addressData)
                );
            
            }
            return addressData;
        } catch (error) {
            console.error('Get address by ID error:', error);
            throw new AppError('Failed to get address by ID', 500);
        }
    }
}

module.exports = new AddressService();
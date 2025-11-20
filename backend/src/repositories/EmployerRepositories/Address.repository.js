const axios = require("axios");
const supabase = require("../../supabase/config");

class AddressRepository {
    /**
     * Find jobs within radius using Haversine formula
     * @param {number} userLat - User's latitude
     * @param {number} userLon - User's longitude
     * @param {number} radiusKm - Search radius in kilometers
     * @returns {Promise<Array>} Jobs with distance
     */
    async findJobsWithinRadius(userLat, userLon, radiusKm) {
        try {
            // Get all jobs with geocoded addresses
            const { data: jobAddresses, error } = await supabase
                .from("job_address")
                .select(`
                    job_id,
                    latitude,
                    longitude,
                    location,
                    jobs (
                        id,
                        title,
                        salary,
                        job_type,
                        requirements,
                        created_at,
                        employer_id,
                        employers!jobs_employer_id_fkey (
                            user_id,
                            company_name,
                            company_logo,
                            industry,
                            users!employers_user_id_fkey (
                                id,
                                email,
                                avatar,
                                username
                            )
                        )
                    )
                `);

            if (error) {
                console.error("Database error fetching jobs:", error);
                throw error;
            }

            if (!jobAddresses || jobAddresses.length === 0) {
                return [];
            }

            // Calculate distance for each job using Haversine formula
            const jobsWithDistance = jobAddresses
                .map((jobAddr) => {
                    const jobLat = parseFloat(jobAddr.latitude);
                    const jobLon = parseFloat(jobAddr.longitude);

                    // Haversine formula
                    const R = 6371; // Earth radius in km
                    const dLat = this._toRad(jobLat - userLat);
                    const dLon = this._toRad(jobLon - userLon);

                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(this._toRad(userLat)) *
                            Math.cos(this._toRad(jobLat)) *
                            Math.sin(dLon / 2) *
                            Math.sin(dLon / 2);

                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c; // Distance in km

                    return {
                        ...jobAddr.jobs,
                        location: jobAddr.location,
                        latitude: jobLat,
                        longitude: jobLon,
                        distance: parseFloat(distance.toFixed(2)),
                        employer: {
                            ...jobAddr.jobs.employers,
                            user: jobAddr.jobs.employers?.users
                        },
                    };
                })
                .filter((job) => job.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance);

            return jobsWithDistance;
        } catch (error) {
            console.error("Error in findJobsWithinRadius:", error.message);
            throw error;
        }
    }

    /**
     * Convert degrees to radians
     */
    _toRad(degrees) {
        return (degrees * Math.PI) / 180;
    }

    /**
     * Geocode address with fallback strategies
     */
    async geocodeAddress(address) {
        try {
            // Validate input
            if (!address || address.trim() === "") {
                throw new Error("Address cannot be empty");
            }

            console.log(`Attempting to geocode address: ${address}`);

            // Strategy 1: Try full address first
            let result = await this._callNominatimAPI(address);

            // Strategy 2: If failed, try to extract and search broader location
            if (!result) {
                const broadAddress = this._extractBroadLocation(address);
                console.log(`Trying broader location: ${broadAddress}`);
                result = await this._callNominatimAPI(broadAddress);
            }

            // Strategy 3: If still failed, try city/district only
            if (!result) {
                const cityOnly = this._extractCity(address);
                console.log(`Trying city only: ${cityOnly}`);
                result = await this._callNominatimAPI(cityOnly);
            }

            if (!result) {
                console.log("No geocoding results found after all strategies");
                return null;
            }

            // Parse coordinates
            const latitude = parseFloat(result.lat);
            const longitude = parseFloat(result.lon);

            if (isNaN(latitude) || isNaN(longitude)) {
                throw new Error("Invalid coordinates from geocoding service");
            }

            return {
                latitude,
                longitude,
                display_name: result.display_name,
                original_address: address,
            };
        } catch (error) {
            console.error("Error in geocodeAddress:", error.message);
            throw error;
        }
    }

    /**
     * Call Nominatim API with proper headers and error handling
     */
    async _callNominatimAPI(address) {
        try {
            const response = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        q: address,
                        format: "json",
                        limit: 1,
                        countrycodes: "vn",
                        addressdetails: 1,
                    },
                    headers: {
                        "User-Agent": "JobFindingApp/1.0",
                    },
                    timeout: 5000,
                }
            );

            if (response.data && response.data.length > 0) {
                return response.data[0];
            }

            return null;
        } catch (error) {
            console.error(`Nominatim API error for "${address}":`, error.message);
            return null;
        }
    }

    /**
     * Extract broader location from detailed address
     */
    _extractBroadLocation(address) {
        const parts = address.split(",").map((p) => p.trim());

        if (parts.length >= 3) {
            return parts.slice(-2).join(", ") + ", Hà Nội";
        }

        if (parts.length === 2) {
            return parts.join(", ") + ", Hà Nội";
        }

        return address + ", Hà Nội";
    }

    /**
     * Extract city/province only
     */
    _extractCity(address) {
        const parts = address.split(",").map((p) => p.trim());

        const cities = [
            "Hà Nội",
            "Hồ Chí Minh",
            "Đà Nẵng",
            "Hải Phòng",
            "Cần Thơ",
            "Hà Đông",
            "Long Biên",
            "Hoàn Kiếm",
        ];

        for (const part of parts) {
            for (const city of cities) {
                if (part.includes(city)) {
                    return city + ", Việt Nam";
                }
            }
        }

        return (parts[parts.length - 1] || "Hà Nội") + ", Việt Nam";
    }

    /**
     * Get address by job_id from jobs table (not job_address)
     */
    async getAddressByJobId(job_id) {
        try {
            const { data, error } = await supabase
                .from("jobs")
                .select("location")
                .eq("id", job_id)
                .single();

            if (error) {
                console.error("Database error in getAddressByJobId:", error);
                throw error;
            }

            if (!data || !data.location) {
                throw new Error(`No location found for job_id: ${job_id}`);
            }

            return data.location;
        } catch (error) {
            console.error("Error in getAddressByJobId:", error.message);
            throw error;
        }
    }

    /**
     * Save geocoded address to database
     */
    async saveGeocodedAddress(job_id, latitude, longitude) {
        try {
            // Check if record exists in job_address table
            const { data: existing, error: checkError } = await supabase
                .from("job_address")
                .select("*")
                .eq("job_id", job_id)
                .single();

            if (existing) {
                // Update existing record
                const { data, error } = await supabase
                    .from("job_address")
                    .update({
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq("job_id", job_id)
                    .select()
                    .single();

                if (error) {
                    console.error("Database error updating job_address:", error);
                    throw error;
                }

                return data;
            } else {
                // Get employer_id and address from jobs table
                const { data: jobData, error: jobError } = await supabase
                    .from("jobs")
                    .select("employer_id, location")
                    .eq("id", job_id)
                    .single();

                if (jobError) {
                    console.error("Database error fetching job:", jobError);
                    throw jobError;
                }

                // Insert new record
                const { data, error } = await supabase
                    .from("job_address")
                    .insert({
                        job_id,
                        employer_id: jobData.employer_id,
                        location: jobData.location,
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                    })
                    .select()
                    .single();

                if (error) {
                    console.error("Database error inserting job_address:", error);
                    throw error;
                }

                return data;
            }
        } catch (error) {
            console.error("Error in saveGeocodedAddress:", error.message);
            throw error;
        }
    }

    /**
     * Check if address already geocoded
     */
    async isAddressGeocoded(job_id) {
        try {
            const { data, error } = await supabase
                .from("job_address")
                .select("latitude, longitude")
                .eq("job_id", job_id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Database error in isAddressGeocoded:", error);
                return false;
            }

            return !!(data && data.latitude && data.longitude);
        } catch (error) {
            console.error("Error in isAddressGeocoded:", error.message);
            return false;
        }
    }
}

module.exports = new AddressRepository();
/**
 * Company Entity - Đại diện cho thông tin công ty
 */
export class Company {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.logo = data.logo || null;
    this.description = data.description || "";
    this.industry = data.industry || "";
    this.size = data.size || ""; // '1-50', '51-200', '201-500', '500+'
    this.address = data.address || "";
    this.website = data.website || "";
    this.email = data.email || "";
    this.phone = data.phone || "";
    this.foundedYear = data.foundedYear || null;
    this.benefits = data.benefits || [];
    this.culture = data.culture || "";
    this.isVerified = data.isVerified || false;
    this.rating = data.rating || 0;
    this.reviewCount = data.reviewCount || 0;
    this.employeeCount = data.employeeCount || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Getters
  get displaySize() {
    const sizeMap = {
      "1-50": "1-50 nhân viên",
      "51-200": "51-200 nhân viên",
      "201-500": "201-500 nhân viên",
      "500+": "Trên 500 nhân viên",
    };
    return sizeMap[this.size] || this.size;
  }

  get isLargeCompany() {
    return this.size === "500+" || this.employeeCount > 500;
  }

  get averageRating() {
    return Math.round(this.rating * 10) / 10;
  }

  // Methods
  updateInfo(data) {
    Object.assign(this, {
      ...data,
      updatedAt: new Date(),
    });
  }

  addBenefit(benefit) {
    if (!this.benefits.includes(benefit)) {
      this.benefits.push(benefit);
    }
  }

  removeBenefit(benefit) {
    this.benefits = this.benefits.filter((b) => b !== benefit);
  }

  // Validation
  isValid() {
    return this.name && this.email && this.industry;
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      logo: this.logo,
      description: this.description,
      industry: this.industry,
      size: this.size,
      address: this.address,
      website: this.website,
      email: this.email,
      phone: this.phone,
      foundedYear: this.foundedYear,
      benefits: this.benefits,
      culture: this.culture,
      isVerified: this.isVerified,
      rating: this.rating,
      reviewCount: this.reviewCount,
      employeeCount: this.employeeCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    return new Company(data);
  }
}

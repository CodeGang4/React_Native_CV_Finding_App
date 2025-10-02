/**
 * User Entity - Đại diện cho người dùng (Nhà tuyển dụng)
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || "";
    this.name = data.name || "";
    this.role = data.role || "employer"; // 'employer', 'candidate', 'admin'
    this.avatar = data.avatar || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  // Getters
  get isEmployer() {
    return this.role === "employer";
  }

  get isCandidate() {
    return this.role === "candidate";
  }

  get displayName() {
    return this.name || this.email;
  }

  // Methods
  updateProfile(data) {
    Object.assign(this, {
      ...data,
      updatedAt: new Date(),
    });
  }

  // Validation
  isValid() {
    return this.email && this.email.includes("@") && this.name;
  }

  // Serialization
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      avatar: this.avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }

  static fromJSON(data) {
    return new User(data);
  }
}

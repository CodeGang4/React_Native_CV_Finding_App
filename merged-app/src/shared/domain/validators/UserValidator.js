/**
 * User Validator - Validation rules for user entities
 */

export class UserValidator {
  static validateUserData(userData) {
    const errors = {};

    // Email validation
    if (!userData.email || userData.email.trim().length === 0) {
      errors.email = "Email không được để trống";
    } else if (!this.isValidEmail(userData.email)) {
      errors.email = "Email không đúng định dạng";
    }

    // Name validation
    if (!userData.name || userData.name.trim().length === 0) {
      errors.name = "Tên không được để trống";
    } else if (userData.name.length < 2) {
      errors.name = "Tên phải có ít nhất 2 ký tự";
    } else if (userData.name.length > 50) {
      errors.name = "Tên không được vượt quá 50 ký tự";
    }

    // Role validation
    const validRoles = ["employer", "candidate", "admin"];
    if (userData.role && !validRoles.includes(userData.role)) {
      errors.role = "Vai trò không hợp lệ";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validatePassword(password) {
    const errors = {};

    if (!password || password.length === 0) {
      errors.password = "Mật khẩu không được để trống";
    } else if (password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (password.length > 128) {
      errors.password = "Mật khẩu không được vượt quá 128 ký tự";
    } else if (!this.hasValidPasswordComplexity(password)) {
      errors.password = "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validatePasswordConfirmation(password, confirmPassword) {
    const errors = {};

    if (password !== confirmPassword) {
      errors.confirmPassword = "Xác nhận mật khẩu không khớp";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateRegistrationData(userData) {
    const userValidation = this.validateUserData(userData);
    const passwordValidation = this.validatePassword(userData.password);
    const confirmValidation = this.validatePasswordConfirmation(
      userData.password,
      userData.confirmPassword || userData.recheckPassword
    );

    const allErrors = {
      ...userValidation.errors,
      ...passwordValidation.errors,
      ...confirmValidation.errors,
    };

    return {
      isValid: Object.keys(allErrors).length === 0,
      errors: allErrors,
    };
  }

  static validateLoginData(loginData) {
    const errors = {};

    if (!loginData.email || loginData.email.trim().length === 0) {
      errors.email = "Email không được để trống";
    } else if (!this.isValidEmail(loginData.email)) {
      errors.email = "Email không đúng định dạng";
    }

    if (!loginData.password || loginData.password.length === 0) {
      errors.password = "Mật khẩu không được để trống";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateProfileUpdate(userData, currentUser) {
    const validation = this.validateUserData(userData);

    // Additional validations for profile updates
    if (currentUser && userData.email !== currentUser.email) {
      // Email change requires additional verification
      validation.warnings = validation.warnings || {};
      validation.warnings.email = "Thay đổi email sẽ yêu cầu xác thực lại";
    }

    return validation;
  }

  // Helper methods
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static hasValidPasswordComplexity(password) {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  }

  static isStrongPassword(password) {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return (
      hasLowerCase &&
      hasUpperCase &&
      hasNumber &&
      hasSpecialChar &&
      isLongEnough
    );
  }

  static getPasswordStrength(password) {
    if (!password) return "empty";

    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return "weak";
    if (score <= 3) return "medium";
    if (score <= 4) return "strong";
    return "very-strong";
  }
}

export default UserValidator;

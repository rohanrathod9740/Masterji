export interface PasswordStrengthResult {
  score: number; // 0-5
  strength: "weak" | "good" | "strong";
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[\d]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;

  let strength: "weak" | "good" | "strong";
  if (passedChecks < 3) {
    strength = "weak";
  } else if (passedChecks < 5) {
    strength = "good";
  } else {
    strength = "strong";
  }

  return {
    score: passedChecks,
    strength,
    checks,
  };
};

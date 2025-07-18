// Enhanced password validation utility with comprehensive security checks (TypeScript version)

// Common passwords blacklist (basic set - in production you'd want a larger list)
const COMMON_PASSWORDS = [
    'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
    'letmein', 'welcome', 'monkey', 'dragon', '111111', 'password1',
    'iloveyou', 'admin', 'login', 'master', 'hello', 'freedom', 'whatever',
    'qwerty123', 'trustno1', 'superman', 'batman', 'shadow', 'michael',
    'jennifer', 'computer', 'soccer', 'football', 'baseball', 'princess'
];

// Password validation configuration
export interface PasswordConfig {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    specialChars: string;
    maxRepeatingChars: number;
    checkCommonPasswords: boolean;
    checkUsernameSimilarity: boolean;
}

export const PASSWORD_CONFIG: PasswordConfig = {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    maxRepeatingChars: 3,
    checkCommonPasswords: true,
    checkUsernameSimilarity: true
};

export interface PasswordStrength {
    label: string;
    color: string;
    description: string;
    progress: number;
}

export interface PasswordDetails {
    length: number;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    hasRepeatingChars: boolean;
    hasSequentialChars: boolean;
    hasKeyboardPattern: boolean;
    isCommonPassword: boolean;
    containsUsername: boolean;
}

export interface PasswordValidationResult {
    isValid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
    strength: PasswordStrength;
    details: PasswordDetails;
}

/**
 * Validates password complexity and returns detailed feedback
 */
export function validatePasswordComplexity(
    password: string = '', 
    username: string = '', 
    config: Partial<PasswordConfig> = {}
): PasswordValidationResult {
    const conf = { ...PASSWORD_CONFIG, ...config };
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;
    
    // Length validation
    if (!password) {
        errors.push('Password is required');
        return { 
            isValid: false, 
            score: 0, 
            errors, 
            warnings, 
            strength: { label: 'Invalid', color: 'destructive', description: 'Password is required', progress: 0 },
            details: getPasswordDetails(password, username, conf)
        };
    }
    
    if (password.length < conf.minLength) {
        errors.push(`Password must be at least ${conf.minLength} characters long`);
    } else {
        score += Math.min(20, password.length * 2); // Up to 20 points for length
    }
    
    if (password.length > conf.maxLength) {
        errors.push(`Password must not exceed ${conf.maxLength} characters`);
    }
    
    // Character type validation
    if (conf.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter (A-Z)');
    } else if (/[A-Z]/.test(password)) {
        score += 15;
    }
    
    if (conf.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter (a-z)');
    } else if (/[a-z]/.test(password)) {
        score += 15;
    }
    
    if (conf.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number (0-9)');
    } else if (/\d/.test(password)) {
        score += 15;
    }
    
    if (conf.requireSpecialChars) {
        const specialCharsRegex = new RegExp(`[${conf.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
        if (!specialCharsRegex.test(password)) {
            errors.push(`Password must contain at least one special character (${conf.specialChars})`);
        } else {
            score += 20;
        }
    }
    
    // Advanced pattern checks
    if (conf.maxRepeatingChars) {
        const repeatingPattern = new RegExp(`(.)\\1{${conf.maxRepeatingChars - 1},}`, 'i');
        if (repeatingPattern.test(password)) {
            errors.push(`Password cannot contain more than ${conf.maxRepeatingChars - 1} repeating characters`);
        } else {
            score += 10;
        }
    }
    
    // Sequential character check
    if (hasSequentialChars(password)) {
        warnings.push('Avoid sequential characters like "123" or "abc"');
    } else {
        score += 5;
    }
    
    // Common password check
    if (conf.checkCommonPasswords && COMMON_PASSWORDS.includes(password.toLowerCase())) {
        errors.push('This password is too common. Please choose a more unique password');
    } else {
        score += 10;
    }
    
    // Username similarity check
    if (conf.checkUsernameSimilarity && username && password.toLowerCase().includes(username.toLowerCase())) {
        errors.push('Password cannot contain your username');
    } else if (username) {
        score += 5;
    }
    
    // Keyboard pattern check
    if (hasKeyboardPattern(password)) {
        warnings.push('Avoid keyboard patterns like "qwerty" or "asdf"');
    } else {
        score += 5;
    }
    
    // Calculate final score and strength
    const maxScore = 100;
    const finalScore = Math.min(score, maxScore);
    const strength = getPasswordStrength(finalScore);
    
    return {
        isValid: errors.length === 0,
        score: finalScore,
        errors,
        warnings,
        strength,
        details: getPasswordDetails(password, username, conf)
    };
}

/**
 * Get password strength label and color based on score
 */
export function getPasswordStrength(score: number): PasswordStrength {
    if (score < 30) {
        return {
            label: 'Very Weak',
            color: 'destructive',
            description: 'This password can be easily guessed',
            progress: 20
        };
    } else if (score < 50) {
        return {
            label: 'Weak',
            color: 'destructive',
            description: 'This password needs improvement',
            progress: 40
        };
    } else if (score < 70) {
        return {
            label: 'Fair',
            color: 'default',
            description: 'This password is acceptable but could be stronger',
            progress: 60
        };
    } else if (score < 85) {
        return {
            label: 'Good',
            color: 'secondary',
            description: 'This is a good password',
            progress: 80
        };
    } else {
        return {
            label: 'Excellent',
            color: 'default',
            description: 'This is an excellent password',
            progress: 100
        };
    }
}

/**
 * Get detailed password analysis
 */
function getPasswordDetails(password: string, username: string, config: PasswordConfig): PasswordDetails {
    const specialCharsRegex = new RegExp(`[${config.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    const repeatingPattern = new RegExp(`(.)\\1{${config.maxRepeatingChars - 1},}`, 'i');
    
    return {
        length: password.length,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: specialCharsRegex.test(password),
        hasRepeatingChars: repeatingPattern.test(password),
        hasSequentialChars: hasSequentialChars(password),
        hasKeyboardPattern: hasKeyboardPattern(password),
        isCommonPassword: COMMON_PASSWORDS.includes(password.toLowerCase()),
        containsUsername: username ? password.toLowerCase().includes(username.toLowerCase()) : false
    };
}

/**
 * Check for sequential characters (123, abc, etc.)
 */
function hasSequentialChars(password: string): boolean {
    const sequences = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    
    for (const sequence of sequences) {
        for (let i = 0; i <= sequence.length - 3; i++) {
            const subSeq = sequence.substring(i, i + 3);
            if (password.toLowerCase().includes(subSeq) || password.toLowerCase().includes(subSeq.split('').reverse().join(''))) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Check for common keyboard patterns
 */
function hasKeyboardPattern(password: string): boolean {
    const patterns = [
        'qwerty', 'qwert', 'werty', 'asdf', 'sdfg', 'dfgh', 'zxcv', 'xcvb', 'cvbn',
        'yuiop', 'uiop', 'hjkl', 'jklm', 'nm', '1234', '2345', '3456', '4567',
        '5678', '6789', '7890'
    ];
    
    const lowerPassword = password.toLowerCase();
    return patterns.some(pattern => 
        lowerPassword.includes(pattern) || lowerPassword.includes(pattern.split('').reverse().join(''))
    );
}

/**
 * Generate password strength requirements text
 */
export function getPasswordRequirements(config: Partial<PasswordConfig> = {}): string[] {
    const conf = { ...PASSWORD_CONFIG, ...config };
    const requirements: string[] = [];
    
    requirements.push(`At least ${conf.minLength} characters long`);
    
    if (conf.requireUppercase) requirements.push('Contains uppercase letters (A-Z)');
    if (conf.requireLowercase) requirements.push('Contains lowercase letters (a-z)');
    if (conf.requireNumbers) requirements.push('Contains numbers (0-9)');
    if (conf.requireSpecialChars) requirements.push('Contains special characters (!@#$%^&*...)');
    
    requirements.push('No more than 3 repeating characters');
    requirements.push('Not a common password');
    requirements.push('Avoid keyboard patterns and sequences');
    
    return requirements;
}

/**
 * Check if two passwords match
 */
export interface PasswordMatchResult {
    isMatch: boolean;
    error: string | null;
}

export function validatePasswordMatch(password: string, confirmPassword: string): PasswordMatchResult {
    const isMatch = password === confirmPassword;
    return {
        isMatch,
        error: isMatch ? null : 'Passwords do not match'
    };
}

export default {
    validatePasswordComplexity,
    getPasswordStrength,
    getPasswordRequirements,
    validatePasswordMatch,
    PASSWORD_CONFIG
}; 
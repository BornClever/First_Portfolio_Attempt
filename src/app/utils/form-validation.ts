// Simple Levenshtein distance function for typo detection
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

export const validateEmail = (email: string): { isValid: boolean; error: string | null } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email address is required' };
  }
  
  // More comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Check basic format
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email format (e.g., user@example.com)' };
  }
  
  // Additional checks
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long (max 254 characters)' };
  }
  
  if (email.startsWith('.') || email.endsWith('.') || email.includes('..')) {
    return { isValid: false, error: 'Email contains invalid dot placement' };
  }
  
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) {
    return { isValid: false, error: 'Email local part is too long (before @)' };
  }
  
  if (!domain.includes('.')) {
    return { isValid: false, error: 'Email must have a valid domain (e.g., @example.com)' };
  }
  
  // Check for common typos in popular domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domainLower = domain.toLowerCase();
  
  // Check for close matches to suggest corrections
  for (const commonDomain of commonDomains) {
    if (domainLower !== commonDomain && levenshteinDistance(domainLower, commonDomain) === 1) {
      return { isValid: false, error: `Did you mean "${localPart}@${commonDomain}"?` };
    }
  }
  
  return { isValid: true, error: null };
};
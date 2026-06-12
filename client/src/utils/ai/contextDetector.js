/**
 * Context Detector - Client-side context extraction from URL
 */

const URL_PATTERNS = {
  // /branches/:branch
  branch: /\/branches\/([^\/]+)/,
  
  // /schemes/:branch/:scheme
  scheme: /\/schemes\/([^\/]+)\/([^\/]+)/,
  
  // /semesters/:branch/:scheme/:semester
  semester: /\/semesters\/([^\/]+)\/([^\/]+)\/(\d+)/,
  
  // /subjects/:branch/:scheme/:semester/:subjectCode
  subject: /\/subjects\/([^\/]+)\/([^\/]+)\/(\d+)\/([^\/]+)/,
  
  // /resources/:subjectCode/:resourceId
  resource: /\/resources\/([^\/]+)\/([^\/]+)/
};

class ContextDetector {
  /**
   * Detect context from current URL
   */
  static detectContext(url = window.location.pathname) {
    const context = {
      branch: null,
      scheme: null,
      semester: null,
      subject: null,
      subjectName: null,
      resource: null
    };

    if (!url) return context;

    // Try to match URL patterns (most specific first)
    const subjectMatch = url.match(URL_PATTERNS.subject);
    if (subjectMatch) {
      context.branch = decodeURIComponent(subjectMatch[1]);
      context.scheme = decodeURIComponent(subjectMatch[2]);
      context.semester = parseInt(subjectMatch[3]);
      context.subject = decodeURIComponent(subjectMatch[4]);
      
      // Try to get subject name from localStorage or page
      context.subjectName = this.getSubjectName(context.subject);
      return context;
    }

    const semesterMatch = url.match(URL_PATTERNS.semester);
    if (semesterMatch) {
      context.branch = decodeURIComponent(semesterMatch[1]);
      context.scheme = decodeURIComponent(semesterMatch[2]);
      context.semester = parseInt(semesterMatch[3]);
      return context;
    }

    const schemeMatch = url.match(URL_PATTERNS.scheme);
    if (schemeMatch) {
      context.branch = decodeURIComponent(schemeMatch[1]);
      context.scheme = decodeURIComponent(schemeMatch[2]);
      return context;
    }

    const branchMatch = url.match(URL_PATTERNS.branch);
    if (branchMatch) {
      context.branch = decodeURIComponent(branchMatch[1]);
      return context;
    }

    // Fallback: Check localStorage for saved preferences
    return this.getStoredContext();
  }

  /**
   * Get stored context from localStorage
   */
  static getStoredContext() {
    try {
      const stored = localStorage.getItem('vtu_ai_preferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        return prefs.academicContext || {};
      }
    } catch (e) {
      console.error('Error reading stored context:', e);
    }
    return {};
  }

  /**
   * Save context to localStorage
   */
  static saveContext(context) {
    try {
      const stored = localStorage.getItem('vtu_ai_preferences') || '{}';
      const prefs = JSON.parse(stored);
      prefs.academicContext = context;
      localStorage.setItem('vtu_ai_preferences', JSON.stringify(prefs));
    } catch (e) {
      console.error('Error saving context:', e);
    }
  }

  /**
   * Get subject name (placeholder - could fetch from API or localStorage)
   */
  static getSubjectName(subjectCode) {
    // Try to get from localStorage cache
    try {
      const cache = localStorage.getItem('vtu_subject_names');
      if (cache) {
        const names = JSON.parse(cache);
        return names[subjectCode] || null;
      }
    } catch (e) {
      // Ignore errors
    }
    return null;
  }

  /**
   * Cache subject name
   */
  static cacheSubjectName(subjectCode, subjectName) {
    try {
      const cache = localStorage.getItem('vtu_subject_names') || '{}';
      const names = JSON.parse(cache);
      names[subjectCode] = subjectName;
      localStorage.setItem('vtu_subject_names', JSON.stringify(names));
    } catch (e) {
      console.error('Error caching subject name:', e);
    }
  }

  /**
   * Format context for display
   */
  static formatForDisplay(context) {
    const parts = [];
    
    if (context.subjectName) {
      parts.push(context.subjectName);
    } else if (context.subject) {
      parts.push(context.subject);
    }
    
    if (context.semester) {
      parts.push(`Sem ${context.semester}`);
    }
    
    if (context.branch) {
      parts.push(context.branch);
    }
    
    return parts.join(' • ');
  }

  /**
   * Check if context is available
   */
  static hasContext(context) {
    return !!(context.branch || context.semester || context.subject);
  }

  /**
   * Get context completeness level
   */
  static getContextLevel(context) {
    if (context.subject) return 'subject';
    if (context.semester) return 'semester';
    if (context.scheme) return 'scheme';
    if (context.branch) return 'branch';
    return 'none';
  }
}

export default ContextDetector;

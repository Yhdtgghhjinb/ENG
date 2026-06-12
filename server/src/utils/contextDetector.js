/**
 * Context Detector - Extracts academic context from URL and request
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
   * Detect context from URL path
   */
  static detectFromURL(url) {
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

    return context;
  }

  /**
   * Merge context from multiple sources
   */
  static mergeContext(urlContext, bodyContext, storedContext) {
    return {
      branch: bodyContext?.branch || urlContext?.branch || storedContext?.branch || null,
      scheme: bodyContext?.scheme || urlContext?.scheme || storedContext?.scheme || null,
      semester: bodyContext?.semester || urlContext?.semester || storedContext?.semester || null,
      subject: bodyContext?.subject || urlContext?.subject || storedContext?.subject || null,
      subjectName: bodyContext?.subjectName || urlContext?.subjectName || storedContext?.subjectName || null
    };
  }

  /**
   * Format context for AI system prompt
   */
  static formatForAI(context) {
    if (!context.branch && !context.semester && !context.subject) {
      return '';
    }

    let prompt = '\n\n--- STUDENT CONTEXT ---\n';

    if (context.subject && context.subjectName) {
      prompt += `Currently studying: ${context.subjectName} (${context.subject})\n`;
    } else if (context.subject) {
      prompt += `Subject Code: ${context.subject}\n`;
    }

    if (context.semester) {
      prompt += `Semester: ${context.semester}\n`;
    }

    if (context.scheme) {
      prompt += `Scheme: ${context.scheme}\n`;
    }

    if (context.branch) {
      prompt += `Branch: ${context.branch}\n`;
    }

    prompt += '\nProvide answers specific to this subject, semester, and VTU syllabus.\n';
    prompt += '--- END CONTEXT ---\n\n';

    return prompt;
  }

  /**
   * Validate context completeness
   */
  static isComplete(context) {
    return !!(context.branch && context.scheme && context.semester && context.subject);
  }

  /**
   * Get context level
   */
  static getContextLevel(context) {
    if (context.subject) return 'subject';
    if (context.semester) return 'semester';
    if (context.scheme) return 'scheme';
    if (context.branch) return 'branch';
    return 'none';
  }
}

module.exports = ContextDetector;

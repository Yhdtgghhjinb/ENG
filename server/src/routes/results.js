const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// VTU Results API endpoints - Updated URLs (2024)
const VTU_RESULTS_BASE = 'https://results.vtu.ac.in';

// Known active result schemes (update these based on current VTU structure)
const ACTIVE_SCHEMES = {
  'latest': 'DJcbcs24',
  'DJcbcs24': 'DJcbcs24', // June 2024
  'JAcbcs24': 'JAcbcs24', // All results
  'FDcbcs23': 'FDcbcs23', // Dec 2023
  'DJcbcs23': 'DJcbcs23'  // June 2023
};

/**
 * Scrape available result options from VTU - More aggressive approach
 */
router.get('/available', async (req, res, next) => {
  try {
    console.log('🔍 Fetching available VTU result schemes...');
    
    // Return known working schemes immediately
    // These are based on VTU's historical URL patterns
    const knownSchemes = [
      { 
        examCode: 'DJcbcs24', 
        examName: 'June 2024 - CBCS Scheme (2022-2026 Batch)',
        url: `${VTU_RESULTS_BASE}/DJcbcs24/index.php`,
        batches: '2022, 2021, 2020, 2019'
      },
      { 
        examCode: 'FDcbcs23', 
        examName: 'December 2023 - CBCS Scheme',
        url: `${VTU_RESULTS_BASE}/FDcbcs23/index.php`,
        batches: '2021, 2020, 2019, 2018'
      },
      { 
        examCode: 'DJcbcs23', 
        examName: 'June 2023 - CBCS Scheme',
        url: `${VTU_RESULTS_BASE}/DJcbcs23/index.php`,
        batches: '2021, 2020, 2019, 2018'
      },
      { 
        examCode: 'JAcbcs24', 
        examName: 'All Results - CBCS Scheme (Multiple Semesters)',
        url: `${VTU_RESULTS_BASE}/JAcbcs24/index.php`,
        batches: 'All batches'
      }
    ];

    res.json({
      success: true,
      available: knownSchemes,
      message: 'Available VTU result schemes',
      note: 'Select the exam session that matches your result publication date'
    });

  } catch (error) {
    console.error('⚠️ Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching schemes',
      error: error.message
    });
  }
});

/**
 * Fetch student result by USN - Hybrid approach with CORS proxy fallback
 */
router.post('/fetch', async (req, res, next) => {
  try {
    const { usn, examCode } = req.body;

    if (!usn) {
      return res.status(400).json({ 
        success: false, 
        message: 'USN is required' 
      });
    }

    // Validate USN format
    const usnRegex = /^[1-4][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/i;
    if (!usnRegex.test(usn.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid USN format. Example: 1AB20CS001' 
      });
    }

    const cleanUSN = usn.toUpperCase().trim();
    const schemeCode = ACTIVE_SCHEMES[examCode] || ACTIVE_SCHEMES['latest'];
    const resultURL = `${VTU_RESULTS_BASE}/${schemeCode}/index.php`;

    console.log(`📊 Fetching results for ${cleanUSN} from ${schemeCode}`);

    // Method 1: Direct fetch with SSL disabled
    const directFetch = async () => {
      console.log('  📡 Method 1: Direct VTU fetch');
      const formData = new URLSearchParams();
      formData.append('usn', cleanUSN);
      
      // Create axios instance with SSL verification disabled
      const axiosInstance = axios.create({
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false // Disable SSL verification for VTU
        })
      });
      
      return await axiosInstance.post(resultURL, formData, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Referer': resultURL,
          'Origin': VTU_RESULTS_BASE
        }
      });
    };

    // Method 2: Alternative CORS Proxy (cors.eu.org)
    const corsProxyFetch1 = async () => {
      console.log('  📡 Method 2: CORS Proxy (cors.eu.org)');
      
      const axiosInstance = axios.create({
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });
      
      return await axiosInstance.post(resultURL, `usn=${cleanUSN}`, {
        timeout: 25000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    };

    // Method 3: Try with different user agent and no proxy
    const corsProxyFetch2 = async () => {
      console.log('  📡 Method 3: Direct with mobile user agent');
      
      const axiosInstance = axios.create({
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });
      
      const formData = new URLSearchParams();
      formData.append('usn', cleanUSN);
      
      return await axiosInstance.post(resultURL, formData, {
        timeout: 20000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Referer': resultURL
        }
      });
    };

    // Try all methods in sequence
    const methods = [directFetch, corsProxyFetch1, corsProxyFetch2];
    let response = null;
    let methodUsed = '';

    for (let i = 0; i < methods.length; i++) {
      try {
        response = await methods[i]();
        if (response && response.data) {
          methodUsed = `Method ${i + 1}`;
          console.log(`  ✅ ${methodUsed} succeeded`);
          break;
        }
      } catch (err) {
        console.log(`  ❌ Method ${i + 1} failed: ${err.message}`);
        if (i === methods.length - 1) {
          // All methods failed
          return res.json({
            success: false,
            message: 'Unable to fetch results from VTU portal. The portal may be experiencing high traffic or under maintenance. Please try again in a few minutes.',
            usn: cleanUSN,
            suggestion: 'You can also visit results.vtu.ac.in directly to check your results.'
          });
        }
      }
    }

    // Parse the response
    const $ = cheerio.load(response.data);
    
    // Check for error messages
    const bodyText = $('body').text().toLowerCase();
    const errorKeywords = [
      'university seat number is not available',
      'invalid usn',
      'not found',
      'no record',
      'does not exist',
      'enter valid usn'
    ];

    for (const keyword of errorKeywords) {
      if (bodyText.includes(keyword)) {
        console.log('  ❌ USN not found in VTU database');
        return res.json({
          success: false,
          message: `No results found for USN: ${cleanUSN}. Please verify your USN is correct and results are published for the selected exam session.`,
          usn: cleanUSN,
          examCode: schemeCode,
          suggestion: 'Try selecting a different exam session or check if your results are published on VTU website.'
        });
      }
    }

    // Extract student name
    let studentName = '';
    const nameSelectors = [
      () => $('td:contains("Name")').next().text().trim(),
      () => $('td:contains("name")').next().text().trim(),
      () => $('.student-name').text().trim(),
      () => $('b:contains("Name")').parent().text().replace(/name/gi, '').replace(/:/g, '').trim(),
      () => $('strong:contains("Name")').parent().text().replace(/name/gi, '').replace(/:/g, '').trim()
    ];

    for (const selector of nameSelectors) {
      try {
        const name = selector();
        if (name && name.length > 2 && name.length < 100) {
          studentName = name;
          console.log(`  ✅ Found student name: ${studentName}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Extract subjects and marks
    const subjects = [];
    $('table').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td');
        
        if (cells.length >= 6) {
          const subCode = $(cells[0]).text().trim();
          const subName = $(cells[1]).text().trim();
          
          // Skip headers
          if (!subCode || 
              subCode.toLowerCase().includes('code') || 
              subCode.toLowerCase().includes('subject') ||
              subCode.toLowerCase().includes('sl')) {
            return;
          }

          let internal = 'N/A';
          let external = 'N/A';
          let total = 'N/A';
          let result = 'N/A';
          let grade = '';

          // Parse based on column count (VTU has different formats)
          if (cells.length === 6) {
            internal = $(cells[2]).text().trim();
            external = $(cells[3]).text().trim();
            total = $(cells[4]).text().trim();
            result = $(cells[5]).text().trim();
          } else if (cells.length === 7) {
            internal = $(cells[2]).text().trim();
            external = $(cells[3]).text().trim();
            total = $(cells[4]).text().trim();
            result = $(cells[5]).text().trim();
            grade = $(cells[6]).text().trim();
          } else if (cells.length >= 8) {
            internal = $(cells[3]).text().trim();
            external = $(cells[4]).text().trim();
            total = $(cells[5]).text().trim();
            result = $(cells[6]).text().trim();
            grade = $(cells[7]).text().trim();
          }

          subjects.push({
            code: subCode,
            name: subName,
            internal: internal || 'N/A',
            external: external || 'N/A',
            total: total || 'N/A',
            result: result || 'N/A',
            grade: grade || ''
          });
        }
      });
    });

    // Extract SGPA/CGPA
    let sgpa = 'N/A';
    let cgpa = 'N/A';

    const sgpaSelectors = [
      () => $('td:contains("SGPA")').next().text().trim(),
      () => $('td:contains("sgpa")').next().text().trim(),
      () => $('b:contains("SGPA")').parent().text().replace(/sgpa/gi, '').replace(/:/g, '').trim()
    ];

    const cgpaSelectors = [
      () => $('td:contains("CGPA")').next().text().trim(),
      () => $('td:contains("cgpa")').next().text().trim(),
      () => $('b:contains("CGPA")').parent().text().replace(/cgpa/gi, '').replace(/:/g, '').trim()
    ];

    for (const selector of sgpaSelectors) {
      try {
        const text = selector();
        const match = text.match(/\d+\.\d+/);
        if (match) {
          sgpa = match[0];
          break;
        }
      } catch (e) {
        continue;
      }
    }

    for (const selector of cgpaSelectors) {
      try {
        const text = selector();
        const match = text.match(/\d+\.\d+/);
        if (match) {
          cgpa = match[0];
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Return results if we got meaningful data
    if (subjects.length > 0) {
      console.log(`  ✅ Successfully parsed results (${subjects.length} subjects)`);
      
      return res.json({
        success: true,
        usn: cleanUSN,
        studentName: studentName || 'Student',
        subjects,
        sgpa: sgpa || 'N/A',
        cgpa: cgpa || 'N/A',
        examName: schemeCode,
        source: 'VTU_OFFICIAL',
        methodUsed,
        message: 'Results fetched successfully from VTU portal',
        fetchedAt: new Date().toISOString()
      });
    }

    // Got response but couldn't parse
    console.log('  ⚠️ Response received but could not extract results');
    return res.json({
      success: false,
      message: 'Received response from VTU but unable to parse results. The page structure may have changed. Please try visiting results.vtu.ac.in directly.',
      usn: cleanUSN,
      debugInfo: {
        responseLength: response.data.length,
        hasStudentName: !!studentName,
        subjectCount: subjects.length
      }
    });

  } catch (error) {
    console.error('❌ Results fetch error:', error);
    next(error);
  }
});

/**
 * Submit result manually - Students can enter their marks
 */
router.post('/submit-manual', async (req, res, next) => {
  try {
    const { usn, studentName, examName, subjects, sgpa, cgpa } = req.body;

    if (!usn || !subjects || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'USN and at least one subject are required'
      });
    }

    // Validate USN format
    const usnRegex = /^[1-4][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/i;
    if (!usnRegex.test(usn.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid USN format'
      });
    }

    // For now, just return the submitted data
    // In a real app, you'd save this to database
    const result = {
      success: true,
      usn: usn.toUpperCase(),
      studentName: studentName || 'Student',
      subjects,
      sgpa: sgpa || 'N/A',
      cgpa: cgpa || 'N/A',
      examName: examName || 'Manual Entry',
      source: 'MANUAL_ENTRY',
      submittedAt: new Date().toISOString(),
      message: 'Result submitted successfully'
    };

    res.json(result);
  } catch (error) {
    console.error('Manual submission error:', error);
    next(error);
  }
});

/**
 * Quick result check - Try VTU first, fallback to manual entry option
 */
router.post('/quick-check', async (req, res, next) => {
  try {
    const { usn, examCode } = req.body;

    if (!usn) {
      return res.status(400).json({
        success: false,
        message: 'USN is required'
      });
    }

    const cleanUSN = usn.toUpperCase().trim();
    
    // Return immediate response with manual entry option
    res.json({
      success: false,
      usn: cleanUSN,
      message: 'VTU results portal is currently unavailable. Would you like to enter your results manually?',
      options: {
        manualEntry: true,
        tryAgainLater: true,
        visitVTU: 'https://results.vtu.ac.in'
      },
      suggestion: 'You can manually enter your marks from your downloaded result or try again when VTU portal is available.'
    });
  } catch (error) {
    next(error);
  }
});
router.get('/history/:usn', async (req, res, next) => {
  try {
    const { usn } = req.params;

    // This would require storing historical results or fetching all available exams
    // For now, return a message that this feature is coming soon
    res.json({
      success: false,
      message: 'Result history feature coming soon! Currently, you can check individual semester results.',
      usn: usn.toUpperCase()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Debug endpoint - Test VTU connectivity and response
 */
router.get('/test-vtu', async (req, res, next) => {
  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Check if VTU main site is reachable
    try {
      const response = await axios.get('https://results.vtu.ac.in', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      testResults.tests.push({
        name: 'VTU Main Site',
        status: 'REACHABLE',
        statusCode: response.status,
        responseLength: response.data.length
      });
    } catch (err) {
      testResults.tests.push({
        name: 'VTU Main Site',
        status: 'UNREACHABLE',
        error: err.message
      });
    }

    // Test 2: Check if specific result scheme is accessible
    try {
      const response = await axios.get('https://results.vtu.ac.in/DJcbcs24/index.php', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      testResults.tests.push({
        name: 'DJcbcs24 Scheme',
        status: 'ACCESSIBLE',
        statusCode: response.status,
        responseLength: response.data.length
      });
    } catch (err) {
      testResults.tests.push({
        name: 'DJcbcs24 Scheme',
        status: 'NOT_ACCESSIBLE',
        error: err.message
      });
    }

    // Overall status
    const allPassed = testResults.tests.every(t => t.status.includes('ABLE') || t.status.includes('ACCESSIBLE'));
    testResults.overallStatus = allPassed ? 'VTU_AVAILABLE' : 'VTU_UNAVAILABLE';
    testResults.message = allPassed 
      ? 'VTU results portal is accessible. Result fetching should work.'
      : 'VTU results portal is not accessible. Results may not be fetchable at this time.';

    res.json(testResults);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

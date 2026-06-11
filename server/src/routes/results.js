const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// VTU Results API endpoints - Updated for actual VTU structure
const VTU_RESULTS_URLS = {
  main: 'https://results.vtu.ac.in',
  directResult: 'https://results.vtu.ac.in/DJcbcs24/index.php', // Latest scheme
  allResults: 'https://results.vtu.ac.in/JAcbcs24/index.php' // All results page
};

/**
 * Scrape available result options from VTU
 */
router.get('/available', async (req, res, next) => {
  try {
    console.log('🔍 Fetching available VTU result schemes...');
    
    // Try to fetch from VTU main results page
    const response = await axios.get(VTU_RESULTS_URLS.main, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });

    const $ = cheerio.load(response.data);
    const availableResults = [];

    // Extract result links from the page
    $('a[href*="index.php"], a[href*="results"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();
      
      if (href && text && text.length > 5) {
        // Extract scheme code from URL (e.g., DJcbcs24, JAcbcs24)
        const schemeMatch = href.match(/\/([A-Z]{2}[a-z]+\d+)\//);
        const examCode = schemeMatch ? schemeMatch[1] : href;
        
        if (!availableResults.find(r => r.examCode === examCode)) {
          availableResults.push({
            examCode: examCode,
            examName: text,
            url: href.startsWith('http') ? href : `${VTU_RESULTS_URLS.main}${href}`
          });
        }
      }
    });

    console.log(`✅ Found ${availableResults.length} result schemes`);

    // If we found results, return them
    if (availableResults.length > 0) {
      return res.json({
        success: true,
        available: availableResults,
        message: 'Available results fetched successfully'
      });
    }

    // Fallback to known schemes
    throw new Error('No results found on main page');

  } catch (error) {
    console.error('⚠️ Error fetching available results:', error.message);
    
    // Return known VTU result schemes as fallback
    res.json({
      success: true,
      available: [
        { 
          examCode: 'DJcbcs24', 
          examName: 'June 2024 CBCS Scheme Results',
          url: 'https://results.vtu.ac.in/DJcbcs24/index.php'
        },
        { 
          examCode: 'JAcbcs24', 
          examName: 'All Results - CBCS Scheme',
          url: 'https://results.vtu.ac.in/JAcbcs24/index.php'
        },
        { 
          examCode: 'FDcbcs23', 
          examName: 'December 2023 CBCS Results',
          url: 'https://results.vtu.ac.in/FDcbcs23/index.php'
        },
        { 
          examCode: 'DJcbcs23', 
          examName: 'June 2023 CBCS Results',
          url: 'https://results.vtu.ac.in/DJcbcs23/index.php'
        }
      ],
      message: 'Using known VTU result schemes',
      isKnownSchemes: true
    });
  }
});

/**
 * Fetch student result by USN - Real VTU scraping with multiple fallback methods
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

    // Validate USN format (VTU format: 1XX20XX000 or similar)
    const usnRegex = /^[1-4][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/i;
    if (!usnRegex.test(usn.toUpperCase())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid USN format. Example: 1AB20CS001' 
      });
    }

    const cleanUSN = usn.toUpperCase().trim();
    console.log(`📊 Fetching VTU results for USN: ${cleanUSN}, Scheme: ${examCode || 'DJcbcs24'}`);

    // Determine which VTU URL to use based on examCode
    const schemeCode = examCode || 'DJcbcs24';
    const resultURL = `https://results.vtu.ac.in/${schemeCode}/index.php`;

    // Try multiple methods to fetch results
    const methods = [
      // Method 1: Direct POST with form data
      async () => {
        console.log(`  📡 Method 1: Direct POST to ${resultURL}`);
        const formData = new URLSearchParams();
        formData.append('usn', cleanUSN);
        formData.append('rid', 'R01');

        const response = await axios.post(resultURL, formData, {
          timeout: 20000,
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': resultURL,
            'Origin': 'https://results.vtu.ac.in'
          }
        });
        return response;
      },

      // Method 2: GET request with query params
      async () => {
        console.log(`  📡 Method 2: GET request with query params`);
        const response = await axios.get(`${resultURL}?usn=${cleanUSN}`, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        return response;
      },

      // Method 3: Try alternative VTU result URL format
      async () => {
        const altURL = `https://results.vtu.ac.in/${schemeCode}/resultpage.php`;
        console.log(`  📡 Method 3: Alternative URL ${altURL}`);
        const formData = new URLSearchParams();
        formData.append('usn', cleanUSN);

        const response = await axios.post(altURL, formData, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        return response;
      }
    ];

    let response = null;
    let lastError = null;

    // Try each method until one succeeds
    for (let i = 0; i < methods.length; i++) {
      try {
        response = await methods[i]();
        if (response && response.data) {
          console.log(`  ✅ Method ${i + 1} succeeded`);
          break;
        }
      } catch (err) {
        console.log(`  ❌ Method ${i + 1} failed: ${err.message}`);
        lastError = err;
        continue;
      }
    }

    // If all methods failed
    if (!response) {
      console.error('  ❌ All methods failed');
      
      if (lastError?.code === 'ECONNABORTED' || lastError?.code === 'ETIMEDOUT') {
        return res.json({
          success: false,
          message: 'VTU results portal is taking too long to respond. The server might be experiencing high traffic. Please try again in a few minutes.',
          usn: cleanUSN,
          error: 'TIMEOUT'
        });
      }

      return res.json({
        success: false,
        message: 'Could not connect to VTU results portal. The portal may be down or under maintenance. Please try again later or visit results.vtu.ac.in directly.',
        usn: cleanUSN,
        vtuUrl: resultURL,
        error: lastError?.message || 'CONNECTION_FAILED'
      });
    }

    // Parse the response
    const $ = cheerio.load(response.data);
    
    // Check for error messages
    const bodyText = $('body').text().toLowerCase();
    const errorMessages = [
      'university seat number is not available',
      'invalid usn',
      'not found',
      'no record',
      'does not exist'
    ];

    for (const errMsg of errorMessages) {
      if (bodyText.includes(errMsg)) {
        console.log('  ❌ USN not found in VTU records');
        return res.json({
          success: false,
          message: `USN ${cleanUSN} not found in VTU records for ${schemeCode}. Please verify your USN or try a different exam session.`,
          usn: cleanUSN,
          isVTUChecked: true,
          suggestion: 'Make sure you are selecting the correct exam session for your batch.'
        });
      }
    }

    // Extract student information
    let studentName = '';
    
    // Try multiple patterns for name extraction
    const namePatterns = [
      () => $('td:contains("Name"), td:contains("name")').next().text().trim(),
      () => $('div.name, span.name, p.name').first().text().trim(),
      () => $('b:contains("Name:")').parent().text().replace(/Name:/gi, '').trim(),
      () => $('.student-name').text().trim(),
      () => $('td').filter((i, el) => $(el).text().toLowerCase().includes('name')).next().text().trim(),
      () => $('strong:contains("Name")').parent().text().replace(/Name/gi, '').replace(/:/g, '').trim()
    ];
    
    for (const pattern of namePatterns) {
      try {
        const name = pattern();
        if (name && name.length > 2 && name.length < 100 && !name.toLowerCase().includes('father')) {
          studentName = name;
          console.log(`  ✅ Found name: ${studentName}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Extract subjects and marks
    const subjects = [];
    let sgpa = 'N/A';
    let cgpa = 'N/A';

    // Try different table structures VTU uses
    $('table').each((tableIdx, table) => {
      $(table).find('tr').each((i, row) => {
        const cells = $(row).find('td');
        
        if (cells.length >= 6) {
          const subCode = $(cells[0]).text().trim();
          const subName = $(cells[1]).text().trim();
          
          // Skip header rows
          if (subCode.toLowerCase().includes('code') || 
              subCode.toLowerCase().includes('subject') ||
              subCode.toLowerCase().includes('sl') ||
              !subCode) {
            return;
          }

          let internal = 'N/A';
          let external = 'N/A';
          let total = 'N/A';
          let result = 'N/A';
          let grade = '';

          // Parse based on number of columns
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
    const sgpaPatterns = [
      () => $('td:contains("SGPA"), td:contains("sgpa")').next().text().trim(),
      () => $('b:contains("SGPA:")').parent().text().replace(/SGPA:/gi, '').trim(),
      () => $('.sgpa').text().trim(),
      () => $('td').filter((i, el) => $(el).text().toLowerCase() === 'sgpa').next().text().trim()
    ];
    
    const cgpaPatterns = [
      () => $('td:contains("CGPA"), td:contains("cgpa")').next().text().trim(),
      () => $('b:contains("CGPA:")').parent().text().replace(/CGPA:/gi, '').trim(),
      () => $('.cgpa').text().trim(),
      () => $('td').filter((i, el) => $(el).text().toLowerCase() === 'cgpa').next().text().trim()
    ];

    for (const pattern of sgpaPatterns) {
      try {
        const text = pattern();
        const match = text.match(/\d+\.\d+/);
        if (match) {
          sgpa = match[0];
          break;
        }
      } catch (e) {
        continue;
      }
    }

    for (const pattern of cgpaPatterns) {
      try {
        const text = pattern();
        const match = text.match(/\d+\.\d+/);
        if (match) {
          cgpa = match[0];
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // If we got valid data, return it
    if (subjects.length > 0) {
      console.log(`  ✅ Results parsed successfully`);
      console.log(`  👤 Name: ${studentName || 'N/A'}`);
      console.log(`  📝 Subjects: ${subjects.length}`);
      console.log(`  📊 SGPA: ${sgpa}, CGPA: ${cgpa}`);
      
      return res.json({
        success: true,
        usn: cleanUSN,
        studentName: studentName || 'Student Name Not Found',
        subjects,
        sgpa: sgpa || 'N/A',
        cgpa: cgpa || 'N/A',
        examName: schemeCode,
        source: 'VTU_OFFICIAL',
        message: 'Results fetched successfully from VTU portal',
        fetchedAt: new Date().toISOString()
      });
    }

    // If reached here, we got a response but couldn't parse it
    console.log('  ⚠️ Could not extract result data from VTU response');
    console.log(`  📄 Response length: ${response.data.length} bytes`);
    
    return res.json({
      success: false,
      message: 'Received response from VTU but could not parse the results. The VTU portal structure may have changed. Please try visiting results.vtu.ac.in directly.',
      usn: cleanUSN,
      debugInfo: {
        responseLength: response.data.length,
        hasStudentName: !!studentName,
        subjectCount: subjects.length,
        suggestion: 'VTU portal structure might have changed. Please report this issue.'
      }
    });

  } catch (error) {
    console.error('❌ Results fetch error:', error);
    next(error);
  }
});

/**
 * Get result history/statistics
 */
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

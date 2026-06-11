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
 * Fetch student result by USN - Real VTU scraping
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
    let resultURL = VTU_RESULTS_URLS.directResult;
    if (examCode && examCode !== 'latest' && examCode !== 'DJcbcs24') {
      resultURL = `https://results.vtu.ac.in/${examCode}/index.php`;
    }

    try {
      // Step 1: Try direct result fetch with POST
      console.log(`  → Trying ${resultURL}`);
      
      const formData = new URLSearchParams();
      formData.append('usn', cleanUSN);
      formData.append('rid', 'R01'); // Regular results

      const response = await axios.post(resultURL, formData, {
        timeout: 20000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': resultURL,
          'Origin': 'https://results.vtu.ac.in'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Check for error messages
      const errorText = $('body').text().toLowerCase();
      if (errorText.includes('university seat number is not available') || 
          errorText.includes('invalid usn') ||
          errorText.includes('not found') ||
          errorText.includes('no record')) {
        
        console.log('  ❌ USN not found in VTU records');
        return res.json({
          success: false,
          message: `No results found for USN: ${cleanUSN}. Please verify your USN or results may not be published yet.`,
          usn: cleanUSN,
          isVTUChecked: true
        });
      }

      // Extract student information
      let studentName = '';
      let fatherName = '';
      
      // Try multiple patterns for name extraction
      const namePatterns = [
        $('td:contains("Name"), td:contains("name")').next().text().trim(),
        $('div.name, span.name, p.name').text().trim(),
        $('b:contains("Name:")').parent().text().replace('Name:', '').trim(),
        $('.student-name').text().trim()
      ];
      
      for (const pattern of namePatterns) {
        if (pattern && pattern.length > 2 && !pattern.toLowerCase().includes('father')) {
          studentName = pattern;
          break;
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
          
          // VTU usually has 6-8 columns: SubCode, SubName, IA, External, Total, Result, Grade
          if (cells.length >= 6) {
            const subCode = $(cells[0]).text().trim();
            const subName = $(cells[1]).text().trim();
            
            // Skip header rows
            if (subCode.toLowerCase().includes('code') || 
                subCode.toLowerCase().includes('subject') ||
                !subCode) {
              return;
            }

            // Extract marks (VTU format varies)
            let internal = 'N/A';
            let external = 'N/A';
            let total = 'N/A';
            let result = 'N/A';
            let grade = '';

            // Parse based on number of columns
            if (cells.length === 6) {
              // Format: Code, Name, IA, Ext, Total, Result
              internal = $(cells[2]).text().trim();
              external = $(cells[3]).text().trim();
              total = $(cells[4]).text().trim();
              result = $(cells[5]).text().trim();
            } else if (cells.length === 7) {
              // Format: Code, Name, IA, Ext, Total, Result, Grade
              internal = $(cells[2]).text().trim();
              external = $(cells[3]).text().trim();
              total = $(cells[4]).text().trim();
              result = $(cells[5]).text().trim();
              grade = $(cells[6]).text().trim();
            } else if (cells.length === 8) {
              // Format: Code, Name, Credits, IA, Ext, Total, Result, Grade
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

      // Extract SGPA/CGPA - VTU shows these at bottom of result
      const sgpaPatterns = [
        $('td:contains("SGPA"), td:contains("sgpa")').next().text().trim(),
        $('b:contains("SGPA:")').parent().text().replace(/SGPA:/gi, '').trim(),
        $('.sgpa').text().trim()
      ];
      
      const cgpaPatterns = [
        $('td:contains("CGPA"), td:contains("cgpa")').next().text().trim(),
        $('b:contains("CGPA:")').parent().text().replace(/CGPA:/gi, '').trim(),
        $('.cgpa').text().trim()
      ];

      for (const pattern of sgpaPatterns) {
        if (pattern && pattern.match(/\d+\.\d+/)) {
          sgpa = pattern.match(/\d+\.\d+/)[0];
          break;
        }
      }

      for (const pattern of cgpaPatterns) {
        if (pattern && pattern.match(/\d+\.\d+/)) {
          cgpa = pattern.match(/\d+\.\d+/)[0];
          break;
        }
      }

      // If we got valid data, return it
      if (subjects.length > 0 || studentName) {
        console.log(`  ✅ Results fetched successfully for ${studentName || cleanUSN}`);
        console.log(`  📝 Found ${subjects.length} subjects`);
        
        return res.json({
          success: true,
          usn: cleanUSN,
          studentName: studentName || 'Student',
          subjects,
          sgpa: sgpa || 'N/A',
          cgpa: cgpa || 'N/A',
          examName: examCode || 'Latest Results',
          source: 'VTU_OFFICIAL',
          message: 'Results fetched successfully from VTU portal',
          fetchedAt: new Date().toISOString()
        });
      }

      // If no meaningful data extracted, log the response for debugging
      console.log('  ⚠️ Could not extract result data from VTU response');
      console.log('  📄 Response length:', response.data.length);
      
      // Return info that scraping failed but USN might be valid
      return res.json({
        success: false,
        message: 'Unable to fetch results from VTU portal. The portal structure may have changed or results are not published yet.',
        usn: cleanUSN,
        debugInfo: {
          responseLength: response.data.length,
          hasStudentName: !!studentName,
          subjectCount: subjects.length
        }
      });

    } catch (vtuError) {
      console.error('  ❌ VTU fetch error:', vtuError.message);
      
      // If it's a network/timeout error
      if (vtuError.code === 'ECONNABORTED' || vtuError.code === 'ETIMEDOUT') {
        return res.json({
          success: false,
          message: 'VTU results portal is not responding. Please try again later.',
          usn: cleanUSN,
          error: 'TIMEOUT'
        });
      }

      // Return error info
      return res.json({
        success: false,
        message: 'Could not connect to VTU results portal. The portal may be down or under maintenance.',
        usn: cleanUSN,
        error: vtuError.message
      });
    }

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

module.exports = router;

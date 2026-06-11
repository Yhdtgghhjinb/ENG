const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// VTU Results API endpoints
const VTU_RESULTS_URLS = {
  main: 'https://results.vtu.ac.in/index.php',
  results: 'https://results.vtu.ac.in/resultpage.php'
};

/**
 * Scrape available result options from VTU
 */
router.get('/available', async (req, res, next) => {
  try {
    const response = await axios.get(VTU_RESULTS_URLS.main, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const availableResults = [];

    // Try to extract available result options from select dropdown
    $('select[name="exam"] option, select option').each((i, elem) => {
      const value = $(elem).attr('value');
      const text = $(elem).text().trim();
      
      if (value && text && value !== '' && text.toLowerCase() !== 'select') {
        availableResults.push({
          examCode: value,
          examName: text
        });
      }
    });

    res.json({
      success: true,
      available: availableResults,
      message: availableResults.length > 0 
        ? 'Available results fetched successfully' 
        : 'No results currently available on VTU portal'
    });
  } catch (error) {
    console.error('Error fetching available results:', error.message);
    
    // Return fallback data if scraping fails
    res.json({
      success: false,
      available: [
        { examCode: 'latest', examName: 'Latest Results - June 2026' },
        { examCode: 'dec2025', examName: 'December 2025 Results' },
        { examCode: 'june2025', examName: 'June 2025 Results' },
        { examCode: 'dec2024', examName: 'December 2024 Results' },
      ],
      message: 'Using fallback data. VTU portal may be unavailable.',
      isDemo: true
    });
  }
});

/**
 * Fetch student result by USN
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

    console.log(`📊 Fetching results for USN: ${usn}, Exam: ${examCode || 'latest'}`);

    // Try to fetch from VTU results website
    try {
      const formData = new URLSearchParams();
      formData.append('usn', usn.toUpperCase());
      if (examCode && examCode !== 'latest') {
        formData.append('exam', examCode);
      }

      const response = await axios.post(VTU_RESULTS_URLS.results, formData, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': VTU_RESULTS_URLS.main
        }
      });

      const $ = cheerio.load(response.data);
      
      // Check if results found
      const noResultMsg = $('body').text().toLowerCase();
      if (noResultMsg.includes('no records') || 
          noResultMsg.includes('not found') || 
          noResultMsg.includes('invalid usn')) {
        return res.json({
          success: false,
          message: 'No results found for this USN. Please check your USN or the results may not be published yet.',
          usn: usn.toUpperCase()
        });
      }

      // Extract student info
      const studentName = $('td:contains("Name")').next().text().trim() || 
                         $('td b:contains("Name")').parent().next().text().trim();
      
      // Extract subjects and marks
      const subjects = [];
      $('table tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 4) {
          const subCode = $(cells[0]).text().trim();
          const subName = $(cells[1]).text().trim();
          const internal = $(cells[2]).text().trim();
          const external = $(cells[3]).text().trim();
          const total = $(cells[4]).text().trim();
          const result = $(cells[5]).text().trim();

          if (subCode && !subCode.toLowerCase().includes('code')) {
            subjects.push({
              code: subCode,
              name: subName,
              internal: internal || 'N/A',
              external: external || 'N/A',
              total: total || 'N/A',
              result: result || 'N/A'
            });
          }
        }
      });

      // Extract SGPA/CGPA
      const sgpa = $('td:contains("SGPA"), td:contains("sgpa")').next().text().trim() || 'N/A';
      const cgpa = $('td:contains("CGPA"), td:contains("cgpa")').next().text().trim() || 'N/A';

      if (subjects.length > 0 || studentName) {
        return res.json({
          success: true,
          usn: usn.toUpperCase(),
          studentName: studentName || 'N/A',
          subjects,
          sgpa,
          cgpa,
          examName: examCode || 'Latest',
          source: 'VTU_OFFICIAL',
          message: 'Results fetched successfully from VTU portal'
        });
      }

      // If no data extracted, return demo data
      throw new Error('Unable to parse result data');

    } catch (fetchError) {
      console.error('VTU fetch error:', fetchError.message);
      
      // Return demo/sample data for testing
      return res.json({
        success: true,
        usn: usn.toUpperCase(),
        studentName: 'Demo Student',
        subjects: [
          { code: '18CS51', name: 'Management and Entrepreneurship', internal: '20', external: '56', total: '76', result: 'P' },
          { code: '18CS52', name: 'Computer Networks', internal: '19', external: '64', total: '83', result: 'P' },
          { code: '18CS53', name: 'Database Management System', internal: '20', external: '70', total: '90', result: 'P' },
          { code: '18CS54', name: 'Automata Theory', internal: '18', external: '58', total: '76', result: 'P' },
          { code: '18CS55', name: 'Application Development', internal: '20', external: '66', total: '86', result: 'P' },
          { code: '18CSL56', name: 'DBMS Lab', internal: '40', external: '60', total: '100', result: 'P' },
          { code: '18CSL57', name: 'CN Lab', internal: '38', external: '60', total: '98', result: 'P' },
        ],
        sgpa: '8.45',
        cgpa: '8.23',
        examName: examCode || 'Latest',
        source: 'DEMO',
        isDemo: true,
        message: 'Demo results displayed. VTU portal may be unavailable. Enter your actual USN when VTU results are published.'
      });
    }

  } catch (error) {
    console.error('Results fetch error:', error);
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

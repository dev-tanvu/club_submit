// ============================================
// GOOGLE APPS SCRIPT FOR PHOTOGRAPHY CONTEST
// ============================================
// Copy this entire code into your Google Apps Script editor

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getActiveSheet();
    
    // If the sheet is empty, add headers
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Category',
        'Full Name (Bengali)',
        'Full Name (English)',
        'Institution Name',
        'Class',
        'Email',
        'Phone Number',
        'WhatsApp Number',
        'Image URLs'
      ];
      sheet.appendRow(headers);
      
      // Format the header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }
    
    // Prepare the row data
    const rowData = [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }), // Timestamp
      data.category || 'N/A',
      data.fullNameBengali || '',
      data.fullNameEnglish || '',
      data.institutionName || '',
      data.class || '',
      data.email || '',
      data.phone || '',
      data.whatsapp || '',
      Array.isArray(data.imageUrls) ? data.imageUrls.join('\n') : data.imageUrls || ''
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, 10);
    
    // Log the submission
    Logger.log('New submission added: ' + data.fullNameEnglish);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data submitted successfully to Google Sheets' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error
    Logger.log('Error: ' + error.toString());
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testScript() {
  const testData = {
    category: 'junior',
    fullNameBengali: 'টেস্ট নাম',
    fullNameEnglish: 'Test Name',
    institutionName: 'Test Institution',
    class: 'Class 10',
    email: 'test@example.com',
    phone: '01712345678',
    whatsapp: '01712345678',
    imageUrls: [
      'https://res.cloudinary.com/example/image1.jpg',
      'https://res.cloudinary.com/example/image2.jpg'
    ],
    timestamp: new Date().toISOString()
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

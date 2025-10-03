// Google Apps Script Code for Form Submission
// Copy this code into your Google Apps Script editor

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Prepare the row data
    const rowData = [
      data.fullNameBengali,
      data.fullNameEnglish,
      data.institutionName,
      data.class,
      data.email,
      data.phone,
      data.whatsapp,
      data.imageUrls.join(', '), // Join multiple image URLs with comma
      data.timestamp
    ];
    
    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Full Name (Bengali)',
        'Full Name (English)',
        'Institution Name',
        'Class',
        'Email',
        'Phone Number',
        'WhatsApp Number',
        'Image URLs',
        'Submission Time'
      ];
      sheet.appendRow(headers);
    }
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data submitted successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Function to test the script
function testScript() {
  const testData = {
    fullNameBengali: 'টেস্ট নাম',
    fullNameEnglish: 'Test Name',
    institutionName: 'Test Institution',
    class: 'Test Class',
    email: 'test@example.com',
    phone: '12345678901',
    whatsapp: '12345678901',
    imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    timestamp: new Date().toISOString()
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log(result.getContent());
}

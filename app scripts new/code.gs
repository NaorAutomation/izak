// ========== Configuration ==========
const PARENT_FOLDER_ID = '1KI4qaQEMyBg3qs2XduVm1IwVpf5D7ahH';
const SHEET_ID = '1z8poAxnNzezMGUQQYPPD4kmPhqzH268OE-pecnrKl3k';
const EMAIL_RECIPIENT = 'naorbarzion@gmail.com';

// ========== Main Handler ==========
function doPost(e) {
  try {
    // Check if e exists and has postData
    if (!e || !e.postData || !e.postData.contents) {
      Logger.log('ERROR: Invalid request - missing postData');
      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: 'error',
          message: 'Invalid request format. Please submit through the web form.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    if (!data.fullName || !data.email) {
      Logger.log('ERROR: Missing required fields');
      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: 'error',
          message: 'Missing required fields: fullName and email'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    Logger.log('Received form from: ' + data.fullName + ' (' + data.email + ')');
    
    // 1. Create client folder
    const clientFolder = createClientFolder(data.fullName);
    Logger.log('Created folder: ' + clientFolder.getName());
    
    // 2. Upload files
    const fileLinks = uploadFiles(data.files, clientFolder);
    Logger.log('Uploaded files to categories');
    
    // 3. Update Google Sheet
    updateSheet(data, clientFolder.getUrl(), fileLinks);
    Logger.log('Sheet updated');
    
    // 4. Send email
    sendEmail(data, clientFolder.getUrl(), fileLinks);
    Logger.log('Email sent successfully');
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'success',
        message: 'הטופס נשלח בהצלחה'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    Logger.log('ERROR: ' + err.message);
    Logger.log('Stack: ' + err.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error',
        message: err.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========== Test Function (for manual testing) ==========
function testDoPost() {
  // This function simulates a form submission for testing
  const testData = {
    postData: {
      contents: JSON.stringify({
        fullName: 'ישראל ישראלי',
        phone: '0501234567',
        email: 'test@example.com',
        idNumber: '123456789',
        birthDate: '1980-01-01',
        maritalStatus: 'נשוי',
        spouseBirthdate: '1982-05-15',
        totalChildren: '2',
        childrenUnder20: '1',
        residenceType: 'שכירות',
        address: 'רחוב הרצל 10, תל אביב',
        rooms: '3',
        rentAmount: '5000',
        bornInIsrael: 'כן',
        employed: 'כן',
        companyName: 'חברה בע"מ',
        jobTitle: 'עובד',
        netSalary: '8000',
        spouseEmployed: 'לא',
        spouseNetSalary: '',
        yearsOfStudy: '12',
        hasBagrut: 'כן',
        hasProfession: 'לא',
        hasDegree: 'לא',
        hasCar: 'לא',
        hasBankAccount: 'כן',
        bankName: 'לאומי',
        bankBranch: '123',
        bankAccount: '456789',
        hasTrafficDebts: 'לא',
        traveledAbroad: 'לא',
        files: [] // Empty files for test
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log('Test result: ' + result.getContent());
  return result.getContent();
}

// ========== Create Client Folder ==========
function createClientFolder(clientName) {
  const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'dd-MM-yyyy HH:mm');
  const folderName = clientName + ' - ' + timestamp;
  
  const clientFolder = parentFolder.createFolder(folderName);
  
  // Create subfolders
  clientFolder.createFolder('📄 תעודת זהות');
  clientFolder.createFolder('📋 מסמכי גירושין');
  clientFolder.createFolder('🏠 מסמכי מגורים');
  clientFolder.createFolder('💼 תלושי משכורת');
  clientFolder.createFolder('🚗 רישיון רכב');
  clientFolder.createFolder('🏦 מסמכי בנק');
  
  return clientFolder;
}

// ========== Upload Files ==========
function uploadFiles(filesData, clientFolder) {
  const fileLinks = {};
  
  if (!filesData || filesData.length === 0) {
    return fileLinks;
  }
  
  const categoryMapping = {
    'id': '📄 תעודת זהות',
    'divorceCert': '📋 מסמכי גירושין',
    'rentContract': '🏠 מסמכי מגורים',
    'salarySlips': '💼 תלושי משכורת',
    'carLicense': '🚗 רישיון רכב',
    'bankStatement': '🏦 מסמכי בנק',
    'balanceSummary': '🏦 מסמכי בנק'
  };
  
  filesData.forEach(fileObj => {
    try {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(fileObj.base64),
        fileObj.mimeType,
        fileObj.name
      );
      
      // Get target folder
      const targetFolderName = categoryMapping[fileObj.category] || 'כללי';
      let targetFolder = clientFolder;
      
      const subfolders = clientFolder.getFolders();
      while (subfolders.hasNext()) {
        const folder = subfolders.next();
        if (folder.getName().includes(targetFolderName.replace(/📄|📋|🏠|💼|🚗|🏦/g, '').trim())) {
          targetFolder = folder;
          break;
        }
      }
      
      const file = targetFolder.createFile(blob);
      
      if (!fileLinks[fileObj.category]) {
        fileLinks[fileObj.category] = [];
      }
      
      fileLinks[fileObj.category].push({
        name: file.getName(),
        url: file.getUrl(),
        id: file.getId()
      });
      
      Logger.log('Uploaded: ' + file.getName());
      
    } catch (err) {
      Logger.log('Error uploading file ' + fileObj.name + ': ' + err.message);
    }
  });
  
  return fileLinks;
}

// ========== Update Google Sheet ==========
function updateSheet(data, folderUrl, fileLinks) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  
  // Count files
  let totalFiles = 0;
  Object.values(fileLinks).forEach(files => {
    totalFiles += files.length;
  });
  
  const row = [
    new Date(),                           // A: תאריך
    data.fullName || '',                  // B: שם מלא
    data.phone || '',                     // C: טלפון
    data.email || '',                     // D: מייל
    data.idNumber || '',                  // E: ת"ז
    data.birthDate || '',                 // F: תאריך לידה
    data.maritalStatus || '',             // G: סטטוס
    data.spouseBirthdate || '',           // H: ת"ל בן/בת זוג
    data.divorceYear || '',               // I: שנת גירושין
    data.totalChildren || '',             // J: ילדים
    data.childrenUnder20 || '',           // K: ילדים <20
    data.residenceType || '',             // L: סוג מגורים
    data.address || '',                   // M: כתובת
    data.rooms || '',                     // N: חדרים
    data.rentAmount || '',                // O: שכירות
    data.mortgageAmount || '',            // P: משכנתא
    data.bornInIsrael || '',              // Q: נולד בארץ
    data.immigrationCountry || '',        // R: מדינת עלייה
    data.immigrationYear || '',           // S: שנת עלייה
    data.employed || '',                  // T: עובד
    data.companyName || '',               // U: חברה
    data.jobTitle || '',                  // V: תפקיד
    data.netSalary || '',                 // W: שכר
    data.spouseEmployed || '',            // X: בן/זוג עובד
    data.spouseNetSalary || '',           // Y: שכר בן/זוג
    data.additionalIncome || '',          // Z: הכנסות נוספות
    data.yearsOfStudy || '',              // AA: שנות לימוד
    data.hasBagrut || '',                 // AB: בגרות
    data.hasProfession || '',             // AC: מקצוע
    data.hasDegree || '',                 // AD: תארים
    data.hasCar || '',                    // AE: רכב
    data.carType || '',                   // AF: סוג רכב
    data.hasBankAccount || '',            // AG: חשבון בנק
    data.bankName || '',                  // AH: שם בנק
    data.hasTrafficDebts || '',           // AI: חובות קנסות
    data.traveledAbroad || '',            // AJ: חו"ל
    data.travelDestinations || '',        // AK: יעדים
    folderUrl,                            // AL: תיקייה
    totalFiles,                           // AM: מס' קבצים
    JSON.stringify(fileLinks)             // AN: קישורי קבצים
  ];
  
  sheet.appendRow(row);
  
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(lastRow, 1, 1, row.length);
  range.setBorder(true, true, true, true, true, true);
  
  // Make folder link clickable
  const folderCell = sheet.getRange(lastRow, 38); // Column AL
  folderCell.setFormula('=HYPERLINK("' + folderUrl + '", "פתח תיקייה")');
  folderCell.setFontColor('#1976d2');
  folderCell.setFontWeight('bold');
}

// ========== Send Email ==========
function sendEmail(data, folderUrl, fileLinks) {
  const htmlBody = buildEmailHTML(data, folderUrl, fileLinks);
  
  MailApp.sendEmail({
    to: EMAIL_RECIPIENT,
    subject: '📋 טופס לקוח חדש - ' + data.fullName,
    htmlBody: htmlBody
  });
}

// ========== Build Email HTML ==========
function buildEmailHTML(data, folderUrl, fileLinks) {
  let filesHTML = '';
  let totalFiles = 0;
  
  const categoryNames = {
    'id': 'תעודת זהות',
    'divorceCert': 'תעודת גירושין',
    'rentContract': 'הסכם שכירות',
    'salarySlips': 'תלושי משכורת',
    'carLicense': 'רישיון רכב',
    'bankStatement': 'תדפיס בנק',
    'balanceSummary': 'ריכוז יתרות'
  };
  
  for (const [category, files] of Object.entries(fileLinks)) {
    if (files && files.length > 0) {
      filesHTML += '<p style="margin: 8px 0;"><strong>' + (categoryNames[category] || category) + ':</strong> ' + files.length + ' קבצים</p>';
      totalFiles += files.length;
    }
  }
  
  return `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; background: #f5f7fa; padding: 20px; margin: 0; }
    .container { max-width: 700px; margin: auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; padding: 20px; background: #f8fafc; border-radius: 12px; border-right: 4px solid #3b82f6; }
    .section h2 { color: #3b82f6; font-size: 22px; margin: 0 0 15px 0; }
    .field { margin: 10px 0; font-size: 16px; }
    .label { font-weight: 600; color: #334155; display: inline-block; min-width: 180px; }
    .value { color: #64748b; }
    .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 טופס לקוח חדש</h1>
      <p>לילך אביאני - פירוק חברה חדלות פירעון והסדר נושאים</p>
    </div>
    
    <div class="content">
      
      <div class="section">
        <h2>👤 פרטי החייב</h2>
        <div class="field"><span class="label">שם מלא:</span> <span class="value">${data.fullName || '-'}</span></div>
        <div class="field"><span class="label">טלפון:</span> <span class="value">${data.phone || '-'}</span></div>
        <div class="field"><span class="label">מייל:</span> <span class="value">${data.email || '-'}</span></div>
        <div class="field"><span class="label">תעודת זהות:</span> <span class="value">${data.idNumber || '-'}</span></div>
        <div class="field"><span class="label">תאריך לידה:</span> <span class="value">${data.birthDate || '-'}</span></div>
        <div class="field"><span class="label">סטטוס אישי:</span> <span class="value">${data.maritalStatus || '-'}</span></div>
        ${data.spouseBirthdate ? '<div class="field"><span class="label">ת.ל בן/בת זוג:</span> <span class="value">' + data.spouseBirthdate + '</span></div>' : ''}
        ${data.divorceYear ? '<div class="field"><span class="label">שנת גירושין:</span> <span class="value">' + data.divorceYear + '</span></div>' : ''}
        <div class="field"><span class="label">מספר ילדים:</span> <span class="value">${data.totalChildren || '-'}</span></div>
        <div class="field"><span class="label">ילדים מתחת לגיל 20:</span> <span class="value">${data.childrenUnder20 || '-'}</span></div>
      </div>
      
      <div class="section">
        <h2>🏠 מגורים</h2>
        <div class="field"><span class="label">סוג מגורים:</span> <span class="value">${data.residenceType || '-'}</span></div>
        <div class="field"><span class="label">כתובת:</span> <span class="value">${data.address || '-'}</span></div>
        <div class="field"><span class="label">חדרים:</span> <span class="value">${data.rooms || '-'}</span></div>
        ${data.rentAmount ? '<div class="field"><span class="label">שכירות:</span> <span class="value">' + data.rentAmount + ' ₪</span></div>' : ''}
        ${data.mortgageAmount ? '<div class="field"><span class="label">משכנתא:</span> <span class="value">' + data.mortgageAmount + ' ₪</span></div>' : ''}
        <div class="field"><span class="label">נולד/ה בארץ:</span> <span class="value">${data.bornInIsrael || '-'}</span></div>
        ${data.immigrationCountry ? '<div class="field"><span class="label">עלייה:</span> <span class="value">' + data.immigrationCountry + ' (' + data.immigrationYear + ')</span></div>' : ''}
      </div>
      
      <div class="section">
        <h2>💼 תעסוקה</h2>
        <div class="field"><span class="label">עובד:</span> <span class="value">${data.employed || '-'}</span></div>
        ${data.companyName ? '<div class="field"><span class="label">חברה:</span> <span class="value">' + data.companyName + '</span></div>' : ''}
        ${data.jobTitle ? '<div class="field"><span class="label">תפקיד:</span> <span class="value">' + data.jobTitle + '</span></div>' : ''}
        <div class="field"><span class="label">שכר נטו:</span> <span class="value">${data.netSalary || '-'} ₪</span></div>
        ${data.spouseEmployed === 'כן' ? '<div class="field"><span class="label">שכר בן/בת זוג:</span> <span class="value">' + (data.spouseNetSalary || '') + ' ₪</span></div>' : ''}
        ${data.additionalIncome ? '<div class="field"><span class="label">הכנסות נוספות:</span> <span class="value">' + data.additionalIncome + '</span></div>' : ''}
      </div>
      
      <div class="section">
        <h2>🎓 השכלה</h2>
        <div class="field"><span class="label">שנות לימוד:</span> <span class="value">${data.yearsOfStudy || '-'}</span></div>
        <div class="field"><span class="label">בגרות:</span> <span class="value">${data.hasBagrut || '-'}</span></div>
        <div class="field"><span class="label">מקצוע:</span> <span class="value">${data.hasProfession || '-'}</span></div>
        <div class="field"><span class="label">תארים:</span> <span class="value">${data.hasDegree || '-'}</span></div>
      </div>
      
      <div class="section">
        <h2>🚗 רכב | 🏦 בנק</h2>
        <div class="field"><span class="label">רכב:</span> <span class="value">${data.hasCar || '-'}</span></div>
        ${data.carType ? '<div class="field"><span class="label">סוג רכב:</span> <span class="value">' + data.carType + ' (' + data.carYear + ')</span></div>' : ''}
        <div class="field"><span class="label">חשבון בנק:</span> <span class="value">${data.hasBankAccount || '-'}</span></div>
        ${data.bankName ? '<div class="field"><span class="label">בנק:</span> <span class="value">' + data.bankName + '</span></div>' : ''}
      </div>
      
      <div class="section">
        <h2>ℹ️ מידע נוסף</h2>
        <div class="field"><span class="label">חובות קנסות:</span> <span class="value">${data.hasTrafficDebts || '-'}</span></div>
        <div class="field"><span class="label">נסע לחו"ל:</span> <span class="value">${data.traveledAbroad || '-'}</span></div>
        ${data.travelDestinations ? '<div class="field"><span class="label">יעדים:</span> <span class="value">' + data.travelDestinations + '</span></div>' : ''}
      </div>
      
      <div class="section">
        <h2>📎 קבצים</h2>
        <div class="field"><span class="label">סה"כ:</span> <span class="value">${totalFiles} קבצים</span></div>
        ${filesHTML}
      </div>
      
      <div style="text-align: center;">
        <a href="${folderUrl}" class="button">📁 פתח תיקיית לקוח</a>
      </div>
      
    </div>
    
    <div class="footer">
      <p>נשלח ב-${Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'dd/MM/yyyy HH:mm')}</p>
    </div>
  </div>
</body>
</html>
  `;
}

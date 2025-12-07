// ========== Global State ==========
let currentStep = 1;
const totalSteps = 4;
let allFilesData = {
    id: [],
    divorceCert: [],
    rentContract: [],
    salarySlips: [],
    carLicense: [],
    bankStatement: [],
    balanceSummary: []
};

// ========== Initialize ==========
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setupConditionalLogic();
    setupFileHandlers();
});

// ========== Conditional Logic ==========
function setupConditionalLogic() {
    // סטטוס אישי - נשוי/גרוש
    document.getElementById('maritalStatus').addEventListener('change', (e) => {
        const value = e.target.value;
        const spouseContainer = document.getElementById('spouseBirthdateContainer');
        const divorceContainer = document.getElementById('divorceYearContainer');
        const divorceCertContainer = document.getElementById('divorceCertContainer');
        const spouseEmploymentSection = document.getElementById('spouseEmploymentSection');

        // Show/hide spouse birthdate
        spouseContainer.classList.toggle('hidden', value !== 'נשוי');
        if (value === 'נשוי') {
            document.getElementById('spouseBirthdate').required = true;
            spouseEmploymentSection.classList.remove('hidden');
        } else {
            document.getElementById('spouseBirthdate').required = false;
        }

        // Show/hide divorce year and cert
        divorceContainer.classList.toggle('hidden', value !== 'גרוש');
        divorceCertContainer.classList.toggle('hidden', value !== 'גרוש');
        if (value === 'גרוש') {
            document.getElementById('divorceYear').required = true;
            spouseEmploymentSection.classList.add('hidden');
        } else {
            document.getElementById('divorceYear').required = false;
        }

        if (value !== 'נשוי') {
            spouseEmploymentSection.classList.add('hidden');
        }
    });

    // סוג מגורים
    document.getElementById('residenceType').addEventListener('change', (e) => {
        const value = e.target.value;
        const rentContainer = document.getElementById('rentContainer');
        const mortgageContainer = document.getElementById('mortgageContainer');

        rentContainer.classList.toggle('hidden', value !== 'שכירות');
        mortgageContainer.classList.toggle('hidden', value !== 'דירה בבעלות');

        if (value === 'שכירות') {
            document.getElementById('rentAmount').required = true;
            document.getElementById('mortgageAmount').required = false;
        } else if (value === 'דירה בבעלות') {
            document.getElementById('mortgageAmount').required = true;
            document.getElementById('rentAmount').required = false;
        } else {
            document.getElementById('rentAmount').required = false;
            document.getElementById('mortgageAmount').required = false;
        }
    });

    // נולד בארץ
    document.querySelectorAll('input[name="bornInIsrael"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const immigrationContainer = document.getElementById('immigrationContainer');
            const isNo = e.target.value === 'לא';
            immigrationContainer.classList.toggle('hidden', !isNo);
            document.getElementById('immigrationCountry').required = isNo;
            document.getElementById('immigrationYear').required = isNo;
        });
    });

    // עובד - חייב
    document.querySelectorAll('input[name="employed"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const employmentContainer = document.getElementById('employmentContainer');
            const isEmployed = e.target.value === 'כן';
            employmentContainer.classList.toggle('hidden', !isEmployed);
            document.getElementById('companyName').required = isEmployed;
            document.getElementById('jobTitle').required = isEmployed;
            document.getElementById('jobStartDate').required = isEmployed;
        });
    });

    // עובד - בן/בת זוג
    document.querySelectorAll('input[name="spouseEmployed"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const spouseEmploymentContainer = document.getElementById('spouseEmploymentContainer');
            const isEmployed = e.target.value === 'כן';
            const spouseSalaryInstruction = document.getElementById('spouseSalaryInstruction');
            spouseEmploymentContainer.classList.toggle('hidden', !isEmployed);
            spouseSalaryInstruction.classList.toggle('hidden', !isEmployed);
            document.getElementById('spouseCompanyName').required = isEmployed;
            document.getElementById('spouseJobTitle').required = isEmployed;
            document.getElementById('spouseJobStartDate').required = isEmployed;
        });
    });

    // רכב
    document.querySelectorAll('input[name="hasCar"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const carDetailsContainer = document.getElementById('carDetailsContainer');
            const hasCar = e.target.value === 'כן';
            carDetailsContainer.classList.toggle('hidden', !hasCar);
            document.getElementById('carLicenseNumber').required = hasCar;
            document.getElementById('carYear').required = hasCar;
            document.getElementById('carType').required = hasCar;
        });
    });

    // רכב משועבד
    document.querySelectorAll('input[name="carPledged"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const carPledgeContainer = document.getElementById('carPledgeContainer');
            const isPledged = e.target.value === 'כן';
            carPledgeContainer.classList.toggle('hidden', !isPledged);
            document.getElementById('carPledgeTo').required = isPledged;
        });
    });

    // חשבון בנק
    document.querySelectorAll('input[name="hasBankAccount"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const bankDetailsContainer = document.getElementById('bankDetailsContainer');
            const hasAccount = e.target.value === 'כן';
            bankDetailsContainer.classList.toggle('hidden', !hasAccount);
            document.getElementById('bankName').required = hasAccount;
            document.getElementById('bankBranch').required = hasAccount;
            document.getElementById('bankAccount').required = hasAccount;
        });
    });

    // חו"ל
    document.querySelectorAll('input[name="traveledAbroad"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const travelDestinationsContainer = document.getElementById('travelDestinationsContainer');
            const traveled = e.target.value === 'כן';
            travelDestinationsContainer.classList.toggle('hidden', !traveled);
            document.getElementById('travelDestinations').required = traveled;
        });
    });
}

// ========== File Handlers ==========
function setupFileHandlers() {
    const fileInputs = [
        { id: 'idFiles', category: 'id', preview: 'idFilesPreview' },
        { id: 'divorceCertFiles', category: 'divorceCert', preview: 'divorceCertFilesPreview' },
        { id: 'rentContractFiles', category: 'rentContract', preview: 'rentContractFilesPreview' },
        { id: 'salarySlipsFiles', category: 'salarySlips', preview: 'salarySlipsFilesPreview' },
        { id: 'carLicenseFiles', category: 'carLicense', preview: 'carLicenseFilesPreview' },
        { id: 'bankStatementFiles', category: 'bankStatement', preview: 'bankStatementFilesPreview' },
        { id: 'balanceSummaryFiles', category: 'balanceSummary', preview: 'balanceSummaryFilesPreview' }
    ];

    fileInputs.forEach(input => {
        const element = document.getElementById(input.id);
        if (element) {
            element.addEventListener('change', (e) => {
                handleFiles(e.target.files, input.category, input.preview);
            });
        }
    });
}

async function handleFiles(files, category, previewId) {
    const preview = document.getElementById(previewId);
    preview.innerHTML = '';
    allFilesData[category] = [];

    if (files.length === 0) return;

    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
            showError(`הקובץ "${file.name}" גדול מדי. מקסימום 10MB`);
            continue;
        }

        try {
            const base64 = await toBase64(file);
            allFilesData[category].push({
                name: file.name,
                mimeType: file.type,
                base64: base64.split(',')[1],
                category: category
            });

            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-preview flex items-center gap-2';
            fileDiv.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        <span class="font-semibold">${file.name}</span>
        <span class="text-gray-500">(${(file.size / 1024).toFixed(1)} KB)</span>
      `;
            preview.appendChild(fileDiv);
        } catch (err) {
            showError(`שגיאה בהעלאת הקובץ "${file.name}"`);
        }
    }

    showSuccess(`${files.length} קבצים נבחרו בהצלחה ✓`);
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ========== Step Navigation ==========
function changeStep(direction) {
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }

    const newStep = currentStep + direction;

    if (newStep < 1 || newStep > totalSteps) {
        if (newStep > totalSteps) {
            submitForm();
        }
        return;
    }

    currentStep = newStep;
    updateUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateUI() {
    document.querySelectorAll('.step-container').forEach(container => {
        container.classList.remove('active');
    });
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');

    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressPercent').textContent = Math.round(progress);
    document.getElementById('currentStep').textContent = currentStep;
    document.getElementById('totalSteps').textContent = totalSteps;

    const titles = {
        1: 'פרטי החייב',
        2: 'מגורים ותעסוקה',
        3: 'פרטים נוספים',
        4: 'שאלות אחרונות'
    };
    document.getElementById('stepTitle').textContent = titles[currentStep];

    document.getElementById('prevBtn').style.display = currentStep === 1 ? 'none' : 'block';
    const nextBtn = document.getElementById('nextBtn');
    if (currentStep === totalSteps) {
        nextBtn.innerHTML = `
      שלח טופס
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="22" x2="11" y1="2" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
    `;
    } else {
        nextBtn.innerHTML = `
      הבא
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
    `;
    }
}

// ========== Validation ==========
function validateCurrentStep() {
    const stepDiv = document.querySelector(`[data-step="${currentStep}"]`);
    const requiredFields = stepDiv.querySelectorAll('[required]');

    stepDiv.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500');
    });

    let isValid = true;

    for (const field of requiredFields) {
        let fieldValue = field.value;

        // Check radio buttons separately
        if (field.type === 'radio') {
            const radioGroup = stepDiv.querySelectorAll(`[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(r => r.checked);
            if (!isChecked) {
                radioGroup.forEach(r => r.parentElement.classList.add('border-red-500'));
                isValid = false;
            }
            continue;
        }

        // Check file inputs
        if (field.type === 'file') {
            if (field.files.length === 0 && !field.classList.contains('hidden') && !field.closest('.hidden')) {
                field.nextElementSibling?.classList.add('border-red-500');
                isValid = false;
            }
            continue;
        }

        if (!fieldValue || (field.type === 'checkbox' && !field.checked)) {
            field.classList.add('border-red-500');
            isValid = false;
        }
    }

    if (!isValid) {
        showError('נא למלא את כל השדות החובה המסומנים ב-*');
        return false;
    }

    // Specific validations
    if (currentStep === 1) {
        const idNumber = document.getElementById('idNumber').value;
        if (idNumber && idNumber.length !== 9) {
            document.getElementById('idNumber').classList.add('border-red-500');
            showError('תעודת זהות חייבת להכיל 9 ספרות בדיוק');
            return false;
        }

        const phone = document.getElementById('phone').value;
        if (phone && phone.length !== 10) {
            document.getElementById('phone').classList.add('border-red-500');
            showError('מספר טלפון חייב להכיל 10 ספרות');
            return false;
        }

        // Check required files for step 1
        if (allFilesData.id.length === 0) {
            showError('חובה להעלות צילום תעודת זהות לפני המעבר לשלב הבא');
            return false;
        }

        // Check divorce certificate if divorced
        const maritalStatus = document.getElementById('maritalStatus').value;
        if (maritalStatus === 'גרוש' && allFilesData.divorceCert.length === 0) {
            showError('חובה להעלות תעודת גירושין');
            return false;
        }
    }

    return true;
}

// ========== Submit Form ==========
async function submitForm() {
    showLoading('שולח את הטופס... אנא המתן (זה יכול לקחת מספר שניות)');

    // Collect all files
    const allFiles = [];
    for (const category in allFilesData) {
        allFiles.push(...allFilesData[category]);
    }

    // Collect form data
    const formData = {
        // פרטי חייב
        fullName: document.getElementById('fullName').value,
        idNumber: document.getElementById('idNumber').value,
        birthDate: document.getElementById('birthDate').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        spouseBirthdate: document.getElementById('spouseBirthdate').value,
        divorceYear: document.getElementById('divorceYear').value,
        totalChildren: document.getElementById('totalChildren').value,
        childrenUnder20: document.getElementById('childrenUnder20').value,

        // מגורים
        residenceType: document.getElementById('residenceType').value,
        address: document.getElementById('address').value,
        rooms: document.getElementById('rooms').value,
        rentAmount: document.getElementById('rentAmount').value,
        mortgageAmount: document.getElementById('mortgageAmount').value,
        bornInIsrael: document.querySelector('input[name="bornInIsrael"]:checked')?.value,
        immigrationCountry: document.getElementById('immigrationCountry').value,
        immigrationYear: document.getElementById('immigrationYear').value,

        // תעסוקה - חייב
        employed: document.querySelector('input[name="employed"]:checked')?.value,
        companyName: document.getElementById('companyName').value,
        jobTitle: document.getElementById('jobTitle').value,
        jobStartDate: document.getElementById('jobStartDate').value,
        netSalary: document.getElementById('netSalary').value,

        // תעסוקה - בן/בת זוג
        spouseEmployed: document.querySelector('input[name="spouseEmployed"]:checked')?.value,
        spouseCompanyName: document.getElementById('spouseCompanyName').value,
        spouseJobTitle: document.getElementById('spouseJobTitle').value,
        spouseJobStartDate: document.getElementById('spouseJobStartDate').value,
        spouseNetSalary: document.getElementById('spouseNetSalary').value,

        // הכנסות נוספות
        additionalIncome: Array.from(document.querySelectorAll('input[name="additionalIncome"]:checked')).map(cb => cb.value).join(', '),

        // השכלה
        yearsOfStudy: document.getElementById('yearsOfStudy').value,
        hasBagrut: document.querySelector('input[name="hasBagrut"]:checked')?.value,
        hasProfession: document.querySelector('input[name="hasProfession"]:checked')?.value,
        hasDegree: document.querySelector('input[name="hasDegree"]:checked')?.value,

        // רכב
        hasCar: document.querySelector('input[name="hasCar"]:checked')?.value,
        carLicenseNumber: document.getElementById('carLicenseNumber').value,
        carYear: document.getElementById('carYear').value,
        carType: document.getElementById('carType').value,
        carPledged: document.querySelector('input[name="carPledged"]:checked')?.value,
        carPledgeTo: document.getElementById('carPledgeTo').value,

        // בנק
        hasBankAccount: document.querySelector('input[name="hasBankAccount"]:checked')?.value,
        bankName: document.getElementById('bankName').value,
        bankBranch: document.getElementById('bankBranch').value,
        bankAccount: document.getElementById('bankAccount').value,

        // חובות וחו"ל
        hasTrafficDebts: document.querySelector('input[name="hasTrafficDebts"]:checked')?.value,
        traveledAbroad: document.querySelector('input[name="traveledAbroad"]:checked')?.value,
        travelDestinations: document.getElementById('travelDestinations').value,

        // קבצים
        files: allFiles
    };

    try {
        await fetch('https://script.google.com/macros/s/AKfycbw45t2OJp2WgLA540gjvzA_2V8EzRdZRwKJ-SwcVECmQ5a6jiXn0YySXv4ip1lEROIk8g/exec', {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(formData)
        });

        showSuccess('✅ הטופס נשלח בהצלחה!<br><br>תודה רבה!<br>נחזור אליך בהקדם.');

        setTimeout(() => {
            location.reload();
        }, 4000);

    } catch (error) {
        showError('שגיאה בשליחת הטופס. אנא נסה שוב או פנה טלפונית.');
        console.error('Error:', error);
    }
}

// ========== Messages ==========
function showError(message) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = 'glass rounded-2xl p-6 text-center text-xl font-bold shadow-xl bg-red-100 text-red-700 error-message';
    statusDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="15" x2="9" y1="9" y2="15"></line><line x1="9" x2="15" y1="9" y2="15"></line></svg>
    <div>${message}</div>
  `;
    statusDiv.classList.remove('hidden');

    setTimeout(() => {
        statusDiv.classList.add('hidden');
    }, 5000);
}

function showSuccess(message) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = 'glass rounded-2xl p-6 text-center text-xl font-bold shadow-xl bg-green-100 text-green-700';
    statusDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto mb-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <div>${message}</div>
  `;
    statusDiv.classList.remove('hidden');
}

function showLoading(message) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.className = 'glass rounded-2xl p-6 text-center text-xl font-bold shadow-xl bg-blue-100 text-blue-700';
    statusDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto mb-3 animate-spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
    <div>${message}</div>
  `;
    statusDiv.classList.remove('hidden');
}

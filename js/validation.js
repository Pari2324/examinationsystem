// ============================================
// WEEK 3: FORM VALIDATION & HANDLING
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // 1. FORM ELEMENTS
    // ========================================
    const contactForm = document.getElementById('contactForm');
    const resetBtn = document.getElementById('resetBtn');
    const formStatus = document.getElementById('formStatus');
    
    // Form fields
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const roleSelect = document.getElementById('role');
    const messageTextarea = document.getElementById('message');
    const termsCheckbox = document.getElementById('terms');
    
    // Error message elements
    const fullNameError = document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const roleError = document.getElementById('roleError');
    const messageError = document.getElementById('messageError');
    const termsError = document.getElementById('termsError');

    // ========================================
    // 2. VALIDATION FUNCTIONS
    // ========================================
    
    // Validate Full Name
    function validateFullName() {
        const value = fullNameInput.value.trim();
        
        if (value === '') {
            showError(fullNameInput, fullNameError, 'Full name is required');
            return false;
        }
        
        if (value.length < 3) {
            showError(fullNameInput, fullNameError, 'Name must be at least 3 characters');
            return false;
        }
        
        if (!/^[a-zA-Z\s]+$/.test(value)) {
            showError(fullNameInput, fullNameError, 'Name can only contain letters and spaces');
            return false;
        }
        
        showSuccess(fullNameInput, fullNameError);
        return true;
    }
    
    // Validate Email
    function validateEmail() {
        const value = emailInput.value.trim();
        
        if (value === '') {
            showError(emailInput, emailError, 'Email is required');
            return false;
        }
        
        // Email regex pattern
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailPattern.test(value)) {
            showError(emailInput, emailError, 'Please enter a valid email address');
            return false;
        }
        
        showSuccess(emailInput, emailError);
        return true;
    }
    
    // Validate Phone
    function validatePhone() {
        const value = phoneInput.value.trim();
        
        if (value === '') {
            showError(phoneInput, phoneError, 'Phone number is required');
            return false;
        }
        
        // Phone regex - accepts various formats
        const phonePattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        
        if (!phonePattern.test(value)) {
            showError(phoneInput, phoneError, 'Please enter a valid phone number');
            return false;
        }
        
        showSuccess(phoneInput, phoneError);
        return true;
    }
    
    // Validate Role
    function validateRole() {
        const value = roleSelect.value;
        
        if (value === '') {
            showError(roleSelect, roleError, 'Please select your role');
            return false;
        }
        
        showSuccess(roleSelect, roleError);
        return true;
    }
    
    // Validate Message
    function validateMessage() {
        const value = messageTextarea.value.trim();
        
        if (value === '') {
            showError(messageTextarea, messageError, 'Message is required');
            return false;
        }
        
        if (value.length < 10) {
            showError(messageTextarea, messageError, 'Message must be at least 10 characters');
            return false;
        }
        
        showSuccess(messageTextarea, messageError);
        return true;
    }
    
    // Validate Terms
    function validateTerms() {
        if (!termsCheckbox.checked) {
            showError(termsCheckbox, termsError, 'You must agree to terms and conditions');
            return false;
        }
        
        showSuccess(termsCheckbox, termsError);
        return true;
    }

    // ========================================
    // 3. HELPER FUNCTIONS
    // ========================================
    
    function showError(input, errorElement, message) {
        input.classList.add('error');
        input.classList.remove('success');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    function showSuccess(input, errorElement) {
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    
    function showFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'flex';
        
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }

    // ========================================
    // 4. REAL-TIME VALIDATION (Blur Events)
    // ========================================
    
    fullNameInput.addEventListener('blur', validateFullName);
    emailInput.addEventListener('blur', validateEmail);
    phoneInput.addEventListener('blur', validatePhone);
    roleSelect.addEventListener('change', validateRole);
    messageTextarea.addEventListener('blur', validateMessage);
    termsCheckbox.addEventListener('change', validateTerms);

    // ========================================
    // 5. FORM SUBMISSION
    // ========================================
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        const isFullNameValid = validateFullName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isRoleValid = validateRole();
        const isMessageValid = validateMessage();
        const isTermsValid = validateTerms();
        
        // Check if all validations passed
        if (isFullNameValid && isEmailValid && isPhoneValid && isRoleValid && isMessageValid && isTermsValid) {
            // Show loading state
            const submitBtn = contactForm.querySelector('.btn-submit');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Simulate form submission (2 seconds delay)
            setTimeout(() => {
                // Get form data
                const formData = {
                    fullName: fullNameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    institution: document.getElementById('institution').value.trim(),
                    role: roleSelect.value,
                    message: messageTextarea.value.trim(),
                    timestamp: new Date().toISOString(),
                    id: Date.now()
                };
                
                // Save to localStorage
                saveFormData(formData);
                
                // Show success message
                showFormStatus('✅ Your message has been sent successfully! We will get back to you soon.', 'success');
                showToast('Form submitted successfully! 🎉');
                
                // Reset form
                contactForm.reset();
                
                // Remove success/error classes
                document.querySelectorAll('.success, .error').forEach(el => {
                    el.classList.remove('success', 'error');
                });
                
                // Remove loading state
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Display saved forms
                displaySavedForms();
                
            }, 2000);
            
        } else {
            showFormStatus('❌ Please fix the errors above and try again.', 'error');
            showToast('Please fix form errors', 3000);
        }
    });

    // ========================================
    // 6. LOCAL STORAGE FUNCTIONS
    // ========================================
    
    function saveFormData(data) {
        // Get existing submissions
        let submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        
        // Add new submission
        submissions.push(data);
        
        // Save back to localStorage
        localStorage.setItem('formSubmissions', JSON.stringify(submissions));
        
        console.log('Form data saved:', data);
    }
    
    function getSavedForms() {
        return JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    }
    
    function deleteFormData(id) {
        let submissions = getSavedForms();
        submissions = submissions.filter(sub => sub.id !== id);
        localStorage.setItem('formSubmissions', JSON.stringify(submissions));
        displaySavedForms();
        showToast('Submission deleted');
    }
    
    function displaySavedForms() {
        const savedForms = getSavedForms();
        const savedFormsContainer = document.getElementById('savedForms');
        const savedFormsList = document.getElementById('savedFormsList');
        
        if (savedForms.length === 0) {
            savedFormsContainer.style.display = 'none';
            return;
        }
        
        savedFormsContainer.style.display = 'block';
        savedFormsList.innerHTML = '';
        
        savedForms.reverse().forEach(form => {
            const formItem = document.createElement('div');
            formItem.className = 'saved-form-item';
            formItem.innerHTML = `
                <strong>${form.fullName}</strong>
                <p>Email: ${form.email}</p>
                <p>Role: ${form.role}</p>
                <p>Date: ${new Date(form.timestamp).toLocaleString()}</p>
                <div class="saved-form-actions">
                    <button class="btn-view" onclick="viewFormData(${form.id})">View Details</button>
                    <button class="btn-delete" onclick="deleteFormData(${form.id})">Delete</button>
                </div>
            `;
            savedFormsList.appendChild(formItem);
        });
    }
    
    // Make deleteFormData available globally
    window.deleteFormData = deleteFormData;
    
    window.viewFormData = function(id) {
        const submissions = getSavedForms();
        const form = submissions.find(f => f.id === id);
        if (form) {
            alert(`
Full Name: ${form.fullName}
Email: ${form.email}
Phone: ${form.phone}
Institution: ${form.institution || 'N/A'}
Role: ${form.role}
Message: ${form.message}
Submitted: ${new Date(form.timestamp).toLocaleString()}
            `);
        }
    };

    // ========================================
    // 7. RESET BUTTON
    // ========================================
    
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form?')) {
            contactForm.reset();
            
            // Remove all validation classes
            document.querySelectorAll('.success, .error').forEach(el => {
                el.classList.remove('success', 'error');
            });
            
            // Hide all error messages
            document.querySelectorAll('.error-message').forEach(el => {
                el.classList.remove('show');
            });
            
            formStatus.style.display = 'none';
            showToast('Form reset successfully');
        }
    });

    // ========================================
    // 8. INITIALIZE
    // ========================================
    
    // Display saved forms on page load
    displaySavedForms();
    
    console.log('Form validation initialized');
});
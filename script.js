// script.js - الملف الرئيسي لجافاسكريبت لموقع رشّاد

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initForms();
    initModals();
    initTabs();
    initFilters();
    initCharts();
    
    // Load user data if available
    loadUserData();
    
    // Set current year in footer
    setCurrentYear();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const toggler = document.querySelector('.navbar-toggler');
    const menu = document.querySelector('.navbar-menu');
    
    if (toggler && menu) {
        toggler.addEventListener('click', function() {
            menu.classList.toggle('show');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!toggler.contains(event.target) && !menu.contains(event.target)) {
                menu.classList.remove('show');
            }
        });
    }
}

// Form Validation and Handling
function initForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(this);
        });
    }
    
    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration(this);
        });
    }
    
    // Booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBooking(this);
        });
    }
}

// Modal Handling
function initModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Close modals with close buttons
    document.querySelectorAll('.modal-close, .close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

// Tab Switching
function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs');
    
    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab');
        const tabPanes = container.querySelectorAll('.tab-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show active tab pane
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.getAttribute('data-pane') === tabId) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    });
}

// Filter Functionality
function initFilters() {
    const filterForms = document.querySelectorAll('.filter-form');
    
    filterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters(this);
        });
        
        // Clear filters
        const clearBtn = form.querySelector('.clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                clearFilters(form);
            });
        }
    });
}

// Chart Initialization
function initCharts() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') return;
    
    // Production chart
    const productionCtx = document.getElementById('productionChart');
    if (productionCtx) {
        new Chart(productionCtx, {
            type: 'line',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                datasets: [{
                    label: 'الإنتاجية (طن)',
                    data: [12, 15, 18, 14, 20, 22],
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'الإنتاجية بالطن'
                        }
                    }
                }
            }
        });
    }
    
    // Revenue chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['قمح', 'ذرة', 'فول سوداني', 'سمسم'],
                datasets: [{
                    label: 'الإيرادات (ألف جنيه)',
                    data: [150, 120, 200, 180],
                    backgroundColor: [
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(76, 175, 80, 0.7)',
                        'rgba(255, 152, 0, 0.7)',
                        'rgba(33, 150, 243, 0.7)'
                    ],
                    borderColor: [
                        '#2e7d32',
                        '#4caf50',
                        '#ff9800',
                        '#2196f3'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'الإيرادات بألف جنيه'
                        }
                    }
                }
            }
        });
    }
}

// Load User Data
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('rashadUser'));
    
    if (userData) {
        // Update user avatar in header
        const userAvatarElements = document.querySelectorAll('.user-avatar, .navbar-avatar');
        userAvatarElements.forEach(el => {
            if (el.textContent.trim() === '') {
                el.textContent = userData.firstName.charAt(0);
            }
        });
        
        // Update user name
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            if (el.textContent.trim() === '') {
                el.textContent = `${userData.firstName} ${userData.lastName}`;
            }
        });
        
        // Update user type
        const userTypeElements = document.querySelectorAll('.user-type');
        userTypeElements.forEach(el => {
            if (el.textContent.trim() === '') {
                const userTypeMap = {
                    'farmer': 'مزارع',
                    'supplier': 'مورد',
                    'trader': 'تاجر',
                    'expert': 'خبير'
                };
                el.textContent = userTypeMap[userData.userType] || userData.userType;
            }
        });
        
        // Update user location
        const userLocationElements = document.querySelectorAll('.user-location');
        userLocationElements.forEach(el => {
            if (el.textContent.trim() === '') {
                el.textContent = userData.state;
            }
        });
    }
}

// Handle Login
async function handleLogin(form) {
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const userType = form.querySelector('#userType').value;
    
    // Basic validation
    if (!email || !password || !userType) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تسجيل الدخول...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, you would make an API call to Supabase
        // const { data, error } = await supabase.auth.signInWithPassword({
        //     email: email,
        //     password: password
        // });
        
        // For demo purposes, we'll simulate a successful login
        const userData = {
            email,
            userType,
            firstName: 'محمد',
            lastName: 'أحمد',
            state: 'الجزيرة'
        };
        
        localStorage.setItem('rashadUser', JSON.stringify(userData));
        
        showAlert('تم تسجيل الدخول بنجاح', 'success');
        
        // Redirect based on user type
        setTimeout(() => {
            switch(userType) {
                case 'farmer':
                    window.location.href = 'farmer-dashboard.html';
                    break;
                case 'supplier':
                    window.location.href = 'supplier-dashboard.html';
                    break;
                case 'trader':
                    window.location.href = 'trader-dashboard.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        }, 1000);
        
    } catch (error) {
        showAlert('خطأ في تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى', 'error');
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Registration
async function handleRegistration(form) {
    const firstName = form.querySelector('#firstName').value;
    const lastName = form.querySelector('#lastName').value;
    const email = form.querySelector('#email').value;
    const phone = form.querySelector('#phone').value;
    const state = form.querySelector('#state').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    const userType = form.querySelector('#userType').value;
    const terms = form.querySelector('#terms').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !state || !password || !confirmPassword || !userType) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    if (!terms) {
        showAlert('يجب الموافقة على شروط الخدمة وسياسة الخصوصية', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('كلمات المرور غير متطابقة', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real app, you would make an API call to Supabase
        // const { data, error } = await supabase.auth.signUp({
        //     email: email,
        //     password: password,
        //     options: {
        //         data: {
        //             first_name: firstName,
        //             last_name: lastName,
        //             phone: phone,
        //             state: state,
        //             user_type: userType
        //         }
        //     }
        // });
        
        // For demo purposes, we'll simulate a successful registration
        const userData = {
            firstName,
            lastName,
            email,
            phone,
            state,
            userType,
            registeredAt: new Date().toISOString()
        };
        
        localStorage.setItem('rashadUser', JSON.stringify(userData));
        
        showAlert('تم إنشاء الحساب بنجاح', 'success');
        
        // Redirect based on user type
        setTimeout(() => {
            switch(userType) {
                case 'farmer':
                    window.location.href = 'farmer-dashboard.html';
                    break;
                case 'supplier':
                    window.location.href = 'supplier-dashboard.html';
                    break;
                case 'trader':
                    window.location.href = 'trader-dashboard.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        }, 1500);
        
    } catch (error) {
        showAlert('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى', 'error');
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Booking
async function handleBooking(form) {
    const consultationType = form.querySelector('#consultationType').value;
    const consultationDate = form.querySelector('#consultationDate').value;
    const consultationTime = form.querySelector('#consultationTime').value;
    const consultationDuration = form.querySelector('#consultationDuration').value;
    const consultationNotes = form.querySelector('#consultationNotes').value;
    const expertName = form.querySelector('#bookingExpertName').textContent;
    
    // Validation
    if (!consultationType || !consultationDate || !consultationTime || !consultationDuration) {
        showAlert('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تأكيد الحجز...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Format date
        const dateObj = new Date(consultationDate);
        const formattedDate = dateObj.toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Show success message
        showAlert(`تم حجز استشارة بنجاح!\n\nالتفاصيل:\n- الخبير: ${expertName}\n- النوع: ${consultationType}\n- التاريخ: ${formattedDate}\n- الوقت: ${consultationTime}\n- المدة: ${consultationDuration} دقيقة\n\nستتلقى رسالة تأكيد على بريدك الإلكتروني ورقم هاتفك.`, 'success');
        
        // Close modal
        const modal = form.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Reset form
        form.reset();
        
        // Reset date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateInput = form.querySelector('#consultationDate');
        if (dateInput) {
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
        
    } catch (error) {
        showAlert('حدث خطأ أثناء تأكيد الحجز. يرجى المحاولة مرة أخرى', 'error');
    } finally {
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Apply Filters
function applyFilters(form) {
    const formData = new FormData(form);
    const filters = {};
    
    for (const [key, value] of formData.entries()) {
        if (value) {
            filters[key] = value;
        }
    }
    
    // In a real app, you would make an API call with filters
    console.log('Applying filters:', filters);
    
    // Show loading
    const container = document.querySelector('.products-grid') || document.querySelector('.experts-grid');
    if (container) {
        container.innerHTML = '<div class="loading">جاري تطبيق الفلاتر...</div>';
        
        // Simulate API call delay
        setTimeout(() => {
            // Reload data (in a real app, this would be filtered data from API)
            if (container.classList.contains('products-grid')) {
                loadProducts('crops');
            } else if (container.classList.contains('experts-grid')) {
                loadExperts();
            }
        }, 1000);
    }
}

// Clear Filters
function clearFilters(form) {
    form.reset();
    applyFilters(form);
}

// Show Alert
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fade-in`;
    alertDiv.textContent = message;
    
    // Add to page
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Set Current Year in Footer
function setCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(el => {
        el.textContent = currentYear;
    });
}

// Open Chat Modal
function openChat(sellerName, productName) {
    const modal = document.getElementById('chatModal');
    if (modal) {
        const title = modal.querySelector('.chat-header h3');
        if (title) {
            title.innerHTML = `<i class="fas fa-comments"></i> دردشة مع ${sellerName} - ${productName}`;
        }
        modal.style.display = 'flex';
    }
}

// Send Chat Message
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatBody = document.getElementById('chatBody');
    
    // Add user message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.innerHTML = `
        <div class="message-sender">أنت</div>
        <div class="message-content own">${message}</div>
    `;
    
    chatBody.appendChild(messageDiv);
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Simulate reply after 1 second
    setTimeout(() => {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'chat-message';
        replyDiv.innerHTML = `
            <div class="message-sender">البائع</div>
            <div class="message-content">شكراً لاهتمامك، سنتواصل معك قريباً لتأكيد التفاصيل</div>
        `;
        
        chatBody.appendChild(replyDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
}

// Logout Function
function logout() {
    // Clear localStorage
    localStorage.removeItem('rashadUser');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Initialize Supabase (for real implementation)
// Uncomment and configure when you have Supabase credentials
/*
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
*/

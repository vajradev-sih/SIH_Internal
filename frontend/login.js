document.addEventListener('DOMContentLoaded', async function () {
    // Function to check if user is authenticated
    function isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    // Common elements
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    // Hide message
    function hideMessages() {
        if (errorMessage) errorMessage.classList.add('hidden');
        if (successMessage) successMessage.classList.add('hidden');
    }

    // Show error
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
        }
        console.error('Error:', message);
    }

    // Show success
    function showSuccess(message) {
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.classList.remove('hidden');
        }
        console.log('Success:', message);
    }

    // Redirect if already logged in
    if (isAuthenticated()) {
        try {
            const userJson = localStorage.getItem('user');
            if (userJson && userJson !== 'undefined') {
                const user = JSON.parse(userJson);
                if (user && user.role) {
                    if (user.role === 'super_admin' || user.role === 'department_admin') {
                        window.location.href = 'dashboard/user/admin-dashboard.html';
                    } else {
                        window.location.href = 'dashboard/user/user-dashboard.html';
                    }
                    return;
                }
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }

    // Wait for API to be ready
    try {
        if (window.waitForAPI) {
            await window.waitForAPI();
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Error waiting for API:', error);
    }

    // Login form handling
    const loginButton = document.getElementById('login-button');

    if (loginButton) {
        loginButton.addEventListener('click', async function (e) {
            e.preventDefault();

            hideMessages();

            const email = document.getElementById('user-email')?.value;
            const password = document.getElementById('user-password')?.value;

            if (!email || !password) {
                showError('Please enter both email and password');
                return;
            }

            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';

            try {
                // Use the API client instead of direct fetch
                const response = await window.authAPI.login({ email, password });

                if (response && response.success) {
                    // Store user data and token from your backend response
                    localStorage.setItem('token', response.data.accessToken);
                    localStorage.setItem('user', JSON.stringify(response.data.user));

                    showSuccess('Login successful! Redirecting...');

                    setTimeout(() => {
                        const user = response.data.user;
                        if (user && user.role) {
                            if (user.role === 'super_admin' || user.role === 'department_admin') {
                                window.location.href = 'dashboard/user/admin-dashboard.html';
                            } else {
                                window.location.href = 'dashboard/user/user-dashboard.html';
                            }
                        } else {
                            window.location.href = 'dashboard/user/user-dashboard.html';
                        }
                    }, 1500);
                } else {
                    showError(response.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Login failed. Please check your credentials and try again.');
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = 'Log In';
            }
        });
    }

    // Signup form handling
    const signupButton = document.getElementById('signup-button');

    if (signupButton) {
        signupButton.addEventListener('click', async function () {
            hideMessages();

            const username = document.getElementById('signup-username').value;
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const phone = document.getElementById('signup-phone').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-password-confirm').value;

            if (!username || !name || !email || !phone || !password) {
                showError('Please fill in all required fields');
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match!');
                return;
            }

            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
            if (!passwordRegex.test(password)) {
                showError('Password does not meet complexity requirements');
                return;
            }

            const userData = {
                username,
                name,
                email,
                phoneNumber: phone,
                password,
                role: 'citizen'
            };

            signupButton.disabled = true;
            signupButton.textContent = 'Creating Account...';

            try {
                // Use the API client instead of direct fetch
                const response = await window.authAPI.register(userData);

                if (response && response.success) {
                    showSuccess('Account created successfully! You can now log in.');

                    document.getElementById('signup-form').reset();

                    // Switch to login view after 2 seconds
                    setTimeout(() => {
                        document.querySelector('[x-data]').__x.$data.view = 'login';
                    }, 2000);
                } else {
                    showError(response.message || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showError('Registration failed. Please try again.');
            } finally {
                signupButton.disabled = false;
                signupButton.textContent = 'Create Account';
            }
        });
    }
});
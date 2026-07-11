const API_BASE = 'https://smartmart-erp-backend-production-c56c.up.railway.app/api/';
const API = API_BASE + '/api';
// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + '-form').classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
    hideAlert();
}

document.getElementById('loginTab').addEventListener('click', () => switchTab('login'));
document.getElementById('signupTab').addEventListener('click', () => switchTab('signup'));

// Alert
function showAlert(msg, type) {
    const box = document.getElementById('alertBox');
    box.textContent = msg;
    box.style.display = 'block';
    box.style.background = type === 'error' ? '#fef2f2' : '#f0fdf4';
    box.style.color = type === 'error' ? '#dc2626' : '#16a34a';
    box.style.border = type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0';
}

function hideAlert() {
    document.getElementById('alertBox').style.display = 'none';
    document.getElementById('debugBox').style.display = 'none';
}

function showDebug(msg) {
    const box = document.getElementById('debugBox');
    box.textContent = 'Debug: ' + msg;
    box.style.display = 'block';
}

function togglePass(id, icon) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.textContent = input.type === 'password' ? '👁️' : '🙈';
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (loading) {
        btn.setAttribute('data-orig', btn.innerHTML);
        btn.innerHTML = '⏳ Please wait...';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.getAttribute('data-orig');
        btn.disabled = false;
    }
}

// Safe JSON parse helper — FIX for crash on non-JSON response
function safeParseJSON(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}

// LOGIN
async function handleLogin(e) {
    e.preventDefault();
    hideAlert();

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value; // FIX: no trim on password

    if (!email || !password) {
        showAlert('❌ Please enter email and password', 'error');
        return;
    }

    setLoading('loginBtn', true);

    try {
        showDebug('Connecting to: ' + API_BASE + '/auth/login');

        const res  = await fetch(API_BASE + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const text = await res.text();
        showDebug('Response status: ' + res.status + ' | Body: ' + text.substring(0, 100));

        const data = safeParseJSON(text);

        if (!res.ok) {
            throw new Error((data && data.message) || 'Login failed (status ' + res.status + ')');
        }
        if (!data) {
            throw new Error('Server sent invalid response (not JSON). Check backend logs.');
        }

        localStorage.setItem('token', data.token || '');
        localStorage.setItem('user', JSON.stringify(data.user || {}));

        showAlert('✅ Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'index.html'; }, 800);

    } catch (err) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            showAlert('❌ Cannot connect to backend server', 'error');
            showDebug('Network error - backend might be down: ' + err.message);
        } else {
            showAlert('❌ ' + err.message, 'error');
            showDebug('Error: ' + err.message);
        }
    } finally {
        setLoading('loginBtn', false);
    }
}

// SIGNUP
async function handleSignup(e) {
    e.preventDefault();
    hideAlert();

    const name     = document.getElementById('signupName').value.trim();
    const store    = document.getElementById('signupStore').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value; // FIX: no trim on password

    if (!name || !store || !email || !password) {
        showAlert('❌ Please fill all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('❌ Password must be at least 6 characters', 'error');
        return;
    }

    setLoading('signupBtn', true);

    try {
        showDebug('Connecting to: ' + API_BASE + '/auth/register');

        const res  = await fetch(API_BASE + '/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, storeName: store, email, password })
        });

        const text = await res.text();
        showDebug('Response status: ' + res.status + ' | Body: ' + text.substring(0, 100));

        const data = safeParseJSON(text);

        if (!res.ok) {
            throw new Error((data && data.message) || 'Signup failed (status ' + res.status + ')');
        }
        if (!data) {
            throw new Error('Server sent invalid response (not JSON). Check backend logs.');
        }

        showAlert('✅ Account created! Please login.', 'success');
        document.getElementById('signup-form').reset();
        setTimeout(() => switchTab('login'), 1500);

    } catch (err) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            showAlert('❌ Cannot connect to backend server', 'error');
            showDebug('Network error - backend might be down: ' + err.message);
        } else {
            showAlert('❌ ' + err.message, 'error');
            showDebug('Error: ' + err.message);
        }
    } finally {
        setLoading('signupBtn', false);
    }
}

// Already logged in
if (localStorage.getItem('token')) {
    window.location.href = 'index.html';
}
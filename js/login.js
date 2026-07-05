
// =============================================
//  SmartMart ERP — js/auth.js
//  Fixed version — login/signup working
// =============================================
 
const API_BASE = 'https://smartmart-erp-backend-production-c56c.up.railway.app';
 
// ── 1. TAB SWITCH ──
function switchTab(tab) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + '-form').classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
    hideAlert();
}
 
// Tab buttons pe event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginTab') ?.addEventListener('click', () => switchTab('login'));
    document.getElementById('signupTab')?.addEventListener('click', () => switchTab('signup'));
 
    // Already logged in check
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
    }
});
 
// ── 2. ALERT ──
function showAlert(msg, type) {
    const box = document.getElementById('alertBox');
    box.textContent = msg;
    box.className = 'alert-box alert-' + type;
    box.style.display = 'block';
}
 
function hideAlert() {
    const box = document.getElementById('alertBox');
    if (box) box.style.display = 'none';
}
 
// ── 3. PASSWORD TOGGLE ──
function togglePass(id, icon) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}
 
// ── 4. BUTTON LOADING ──
function setLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
 
    if (isLoading) {
        btn.setAttribute('data-original', btn.innerHTML);
        btn.innerHTML = '<span class="spinner"></span> Please wait...';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.getAttribute('data-original') || btn.innerHTML;
        btn.disabled = false;
    }
}
 
// ── 5. LOGIN ──
async function handleLogin(e) {
    e.preventDefault();
    hideAlert();
 
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
 
    if (!email || !password) {
        showAlert('❌ Email aur password enter karo!', 'error');
        return;
    }
 
    setLoading('loginBtn', true);
 
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
 
        // Response text pehle lo
        const text = await response.text();
 
        // JSON parse karo
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('Server se invalid response aaya');
        }
 
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
 
        // Token save karo
        localStorage.setItem('token', data.token || '');
        localStorage.setItem('user', JSON.stringify(data.user || {}));
 
        showAlert('✅ Login successful! Redirecting...', 'success');
 
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
 
    } catch (err) {
        if (err.message.includes('Failed to fetch') ||
            err.message.includes('NetworkError') ||
            err.message.includes('fetch')) {
            showAlert('❌ Backend connect nahi hua! IntelliJ mein app run karo.', 'error');
        } else {
            showAlert('❌ ' + err.message, 'error');
        }
    } finally {
        setLoading('loginBtn', false);
    }
}
 
// ── 6. SIGNUP ──
async function handleSignup(e) {
    e.preventDefault();
    hideAlert();
 
    const name     = document.getElementById('signupName').value.trim();
    const store    = document.getElementById('signupStore').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
 
    if (!name || !store || !email || !password) {
        showAlert('❌ Sab fields bharo!', 'error');
        return;
    }
 
    if (password.length < 6) {
        showAlert('❌ Password kam se kam 6 characters ka hona chahiye!', 'error');
        return;
    }
 
    setLoading('signupBtn', true);
 
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name,
                storeName: store,
                email,
                password
            })
        });
 
        const text = await response.text();
 
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('Server se invalid response aaya');
        }
 
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }
 
        showAlert('✅ Account ban gaya! Ab login karo.', 'success');
        document.getElementById('signup-form').reset();
        setTimeout(() => switchTab('login'), 1500);
 
    } catch (err) {
        if (err.message.includes('Failed to fetch') ||
            err.message.includes('NetworkError')) {
            showAlert('❌ Backend connect nahi hua! IntelliJ mein app run karo.', 'error');
        } else {
            showAlert('❌ ' + err.message, 'error');
        }
    } finally {
        setLoading('signupBtn', false);
    }
}
 
// ── 7. ENTER KEY ──
document.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        const form = document.querySelector('.auth-form.active');
        if (form) {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) btn.click();
        }
    }
});
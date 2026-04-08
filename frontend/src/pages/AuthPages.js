import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import styles from './AuthPages.module.css';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const validateEmail = (e) => /^[^\s@]+@gmail\.com$/i.test(e);
const validateName  = (n) => /^[A-Za-z]{2,}$/.test(n?.trim());

// Strip spaces/dashes, remove leading 0 (UK local format), leave 10 digits
const sanitizePhone = (raw) => {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('0')) d = d.slice(1); // 07700900123 → 7700900123
  return d.slice(0, 10);
};
// Valid when exactly 10 digits remain
const validatePhone = (digits) => /^\d{10}$/.test(digits);

// ─── Country codes ────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { dial: '+44', iso: 'GB', name: 'United Kingdom' },
  { dial: '+1',  iso: 'US', name: 'United States / Canada' },
  { dial: '+61', iso: 'AU', name: 'Australia' },
  { dial: '+64', iso: 'NZ', name: 'New Zealand' },
  { dial: '+353',iso: 'IE', name: 'Ireland' },
  { dial: '+27', iso: 'ZA', name: 'South Africa' },
  { dial: '+91', iso: 'IN', name: 'India' },
  { dial: '+92', iso: 'PK', name: 'Pakistan' },
  { dial: '+880',iso: 'BD', name: 'Bangladesh' },
  { dial: '+977',iso: 'NP', name: 'Nepal' },
  { dial: '+94', iso: 'LK', name: 'Sri Lanka' },
  { dial: '+971',iso: 'AE', name: 'UAE' },
  { dial: '+966',iso: 'SA', name: 'Saudi Arabia' },
  { dial: '+974',iso: 'QA', name: 'Qatar' },
  { dial: '+965',iso: 'KW', name: 'Kuwait' },
  { dial: '+33', iso: 'FR', name: 'France' },
  { dial: '+49', iso: 'DE', name: 'Germany' },
  { dial: '+34', iso: 'ES', name: 'Spain' },
  { dial: '+39', iso: 'IT', name: 'Italy' },
  { dial: '+31', iso: 'NL', name: 'Netherlands' },
  { dial: '+32', iso: 'BE', name: 'Belgium' },
  { dial: '+41', iso: 'CH', name: 'Switzerland' },
  { dial: '+46', iso: 'SE', name: 'Sweden' },
  { dial: '+47', iso: 'NO', name: 'Norway' },
  { dial: '+45', iso: 'DK', name: 'Denmark' },
  { dial: '+358',iso: 'FI', name: 'Finland' },
  { dial: '+48', iso: 'PL', name: 'Poland' },
  { dial: '+7',  iso: 'RU', name: 'Russia' },
  { dial: '+86', iso: 'CN', name: 'China' },
  { dial: '+81', iso: 'JP', name: 'Japan' },
  { dial: '+82', iso: 'KR', name: 'South Korea' },
  { dial: '+65', iso: 'SG', name: 'Singapore' },
  { dial: '+60', iso: 'MY', name: 'Malaysia' },
  { dial: '+62', iso: 'ID', name: 'Indonesia' },
  { dial: '+63', iso: 'PH', name: 'Philippines' },
  { dial: '+66', iso: 'TH', name: 'Thailand' },
  { dial: '+84', iso: 'VN', name: 'Vietnam' },
  { dial: '+20', iso: 'EG', name: 'Egypt' },
  { dial: '+234',iso: 'NG', name: 'Nigeria' },
  { dial: '+254',iso: 'KE', name: 'Kenya' },
  { dial: '+233',iso: 'GH', name: 'Ghana' },
  { dial: '+55', iso: 'BR', name: 'Brazil' },
  { dial: '+52', iso: 'MX', name: 'Mexico' },
  { dial: '+54', iso: 'AR', name: 'Argentina' },
  { dial: '+56', iso: 'CL', name: 'Chile' },
  { dial: '+57', iso: 'CO', name: 'Colombia' },
  { dial: '+90', iso: 'TR', name: 'Turkey' },
  { dial: '+98', iso: 'IR', name: 'Iran' },
];

const flagEmoji = (iso) =>
  iso.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397));
const validatePassword = (p) => {
  if (p.length < 8)   return 'At least 8 characters required';
  if (!/[A-Z]/.test(p)) return 'Must contain at least one uppercase letter';
  if (!/[0-9]/.test(p)) return 'Must contain at least one number';
  return null;
};
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#e94560', '#f5a623', '#00c896'];
  const labels = ['Weak', 'Fair', 'Strong'];
  return (
    <div className={styles.pwStrength}>
      <div className={styles.pwBars}>
        {[0,1,2].map(i => (
          <div key={i} className={styles.pwBar} style={{ background: i < score ? colors[score-1] : 'var(--border)' }} />
        ))}
      </div>
      <span style={{ color: score > 0 ? colors[score-1] : 'var(--text-muted)', fontSize:'0.75rem', fontWeight:600 }}>
        {score > 0 ? labels[score-1] : ''}
      </span>
      <div className={styles.pwChecks}>
        {checks.map(c => (
          <span key={c.label} className={styles.pwCheck} style={{ color: c.ok ? '#00c896' : 'var(--text-muted)' }}>
            {c.ok ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const FieldError = ({ msg }) => msg ? <span className={styles.fieldError}>⚠ {msg}</span> : null;

const EyeIcon = ({ show, toggle }) => (
  <button type="button" className={styles.eyeBtn} onClick={toggle} tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}>
    {show ? '🙈' : '👁'}
  </button>
);

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [portal, setPortal]     = useState('user');
  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})); };

  const validate = () => {
    const errs = {};
    if (!form.email)               errs.email    = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Enter a valid Gmail address (e.g. you@gmail.com)';
    if (!form.password)            errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password, portal);
      toast.success(`Welcome back, ${user.firstName}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      const msg  = data?.message || 'Sign in failed';
      if (data?.code === 'EMAIL_NOT_VERIFIED') {
        setErrors({ general: msg, unverified: true });
      } else {
        toast.error(msg);
        setErrors({ general: msg });
      }
    } finally { setLoading(false); }
  };

  const portals = [
    { key: 'user',        label: 'User',         icon: '👤', desc: 'Find & book venues'  },
    { key: 'venue_owner', label: 'Venue Owner',  icon: '🏛', desc: 'Manage my listings'  },
    { key: 'admin',       label: 'Admin',        icon: '⚡', desc: 'System administration' },
  ];

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <h1>Sign In</h1>
        <p className={styles.subtitle}>Choose your portal and sign in below</p>

        {/* Portal selector */}
        <div className={styles.portalTabs}>
          {portals.map(p => (
            <button
              key={p.key}
              type="button"
              className={`${styles.portalTab} ${portal === p.key ? styles.portalTabActive : ''}`}
              onClick={() => { setPortal(p.key); setErrors({}); }}
            >
              <span className={styles.portalIcon}>{p.icon}</span>
              <strong>{p.label}</strong>
              <small>{p.desc}</small>
            </button>
          ))}
        </div>

        <div className={styles.portalBanner} data-portal={portal}>
          {portal === 'admin' && <span>🔐 Admin access only. Credentials are controlled by the system administrator.</span>}
          {portal === 'venue_owner' && <span>🏛 For registered venue owners only. Not a venue owner yet? <Link to="/register">Register here</Link>.</span>}
          {portal === 'user' && <span>👤 Welcome! Sign in to browse venues and manage your bookings.</span>}
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {errors.general && (
            <div className={styles.alertError}>
              ⚠ {errors.general}
              {errors.unverified && (
                <> — <Link to="/resend-verification" style={{color:'inherit',fontWeight:700}}>Resend verification email</Link></>
              )}
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label>Email Address</label>
            <input
              type="email" autoComplete="email" placeholder="you@gmail.com"
              value={form.email} onChange={e => set('email', e.target.value)}
              className={errors.email ? styles.inputError : ''}
            />
            <FieldError msg={errors.email} />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label>Password</label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>
            <div className={styles.passwordWrap}>
              <input
                type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)}
                className={errors.password ? styles.inputError : ''}
              />
              <EyeIcon show={showPw} toggle={() => setShowPw(s => !s)} />
            </div>
            <FieldError msg={errors.password} />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Signing in…' : `Sign In as ${portals.find(p=>p.key===portal)?.label}`}
          </button>
        </form>

        {portal !== 'admin' && (
          <p className={styles.switchLine}>
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm]     = useState({ firstName:'', lastName:'', email:'', phone:'', dialCode:'+44', password:'', confirmPassword:'', role:'user' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed]         = useState(false);
  const [registered, setRegistered] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState('');

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setErrors(e => ({...e,[k]:''})); };

  const validate = () => {
    const errs = {};

    if (!form.firstName)
      errs.firstName = 'First name is required';
    else if (!validateName(form.firstName))
      errs.firstName = 'First name must be at least 2 letters (no numbers or symbols)';

    if (!form.lastName)
      errs.lastName = 'Last name is required';
    else if (!validateName(form.lastName))
      errs.lastName = 'Last name must be at least 2 letters (no numbers or symbols)';

    if (!form.email)
      errs.email = 'Email is required';
    else if (!validateEmail(form.email))
      errs.email = 'Only Gmail addresses are accepted (e.g. you@gmail.com)';

    if (!form.phone || !form.phone.trim())
      errs.phone = 'Phone number is required';
    else if (form.dialCode !== '+44')
      errs.phone = 'Only UK (+44) phone numbers are accepted';
    else if (!validatePhone(sanitizePhone(form.phone)))
      errs.phone = 'Enter a valid UK number — 10 digits after +44 (e.g. 7700 900123)';

    if (!form.password)
      errs.password = 'Password is required';
    else {
      const pwErr = validatePassword(form.password);
      if (pwErr) errs.password = pwErr;
    }
    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';

    if (!agreed)
      errs.agreed = 'You must accept the terms to continue';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await register({ ...form, phone: `+44${sanitizePhone(form.phone)}` });
      if (res.linkExpiresAt) {
        setLinkExpiry(new Date(res.linkExpiresAt).toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true,
        }));
      }
      setRegistered(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors(e => ({...e, email: msg}));
      if (msg.toLowerCase().includes('first')) setErrors(e => ({...e, firstName: msg}));
      if (msg.toLowerCase().includes('last'))  setErrors(e => ({...e, lastName:  msg}));
      if (msg.toLowerCase().includes('phone')) setErrors(e => ({...e, phone: msg}));
    } finally { setLoading(false); }
  };

  // ── Post-registration: check your email screen ───────────────────────────────
  if (registered) return (
    <div className={styles.page}>
      <div className={styles.card} style={{textAlign:'center'}}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>📬</div>
        <h1>Verify your email</h1>
        <p className={styles.subtitle}>
          A verification link has been sent to <strong>{form.email}</strong>.<br/>
          Please verify your email before logging in.
        </p>
        {linkExpiry && (
          <p style={{fontSize:'0.82rem',color:'var(--text-muted)',marginTop:'0.5rem'}}>
            Link valid until <strong style={{color:'var(--text-primary)'}}>{linkExpiry}</strong>
          </p>
        )}
        <p className={styles.switchLine}><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <h1>Create Account</h1>
        <p className={styles.subtitle}>Join the intelligent venue platform — free forever</p>

        {/* Role picker */}
        <div className={styles.roleGrid}>
          <label className={`${styles.roleOption} ${form.role==='user' ? styles.roleSelected : ''}`}>
            <input type="radio" name="role" value="user" checked={form.role==='user'} onChange={() => set('role','user')} />
            <span className={styles.roleEmoji}>🔍</span>
            <strong>I want to book venues</strong>
            <small>Find and book spaces for events, meetings, and celebrations</small>
          </label>
          <label className={`${styles.roleOption} ${form.role==='venue_owner' ? styles.roleSelected : ''}`}>
            <input type="radio" name="role" value="venue_owner" checked={form.role==='venue_owner'} onChange={() => set('role','venue_owner')} />
            <span className={styles.roleEmoji}>🏛</span>
            <strong>I want to list venues</strong>
            <small>Manage and rent out my spaces to event organisers</small>
          </label>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* First name / Last name */}
          <div className={styles.formGrid2}>
            <div className={styles.fieldGroup}>
              <label>First Name *</label>
              <input
                placeholder="Jane"
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                className={errors.firstName ? styles.inputError : ''}
              />
              <FieldError msg={errors.firstName} />
            </div>
            <div className={styles.fieldGroup}>
              <label>Last Name *</label>
              <input
                placeholder="Smith"
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                className={errors.lastName ? styles.inputError : ''}
              />
              <FieldError msg={errors.lastName} />
            </div>
          </div>

          {/* Email */}
          <div className={styles.fieldGroup}>
            <label>Gmail Address *</label>
            <input
              type="email" placeholder="you@gmail.com"
              value={form.email} onChange={e => set('email', e.target.value)}
              className={errors.email ? styles.inputError : ''}
            />
            <FieldError msg={errors.email} />
          </div>

          {/* Phone */}
          <div className={styles.fieldGroup}>
            <label>Phone Number * <span className={styles.optional}>(UK numbers only)</span></label>
            <div className={styles.phoneWrap}>
              <select
                className={styles.dialSelect}
                value={form.dialCode}
                onChange={e => { set('dialCode', e.target.value); set('phone', ''); }}
              >
                {COUNTRY_CODES.map(c => (
                  <option key={c.iso} value={c.dial}>
                    {flagEmoji(c.iso)} {c.dial} {c.name}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder={form.dialCode === '+44' ? '7700 900123' : 'UK numbers only'}
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={errors.phone ? styles.inputError : ''}
                maxLength={15}
                disabled={form.dialCode !== '+44'}
              />
            </div>
            <FieldError msg={errors.phone} />
            {form.dialCode === '+44' && form.phone && !errors.phone && validatePhone(sanitizePhone(form.phone)) && (
              <span style={{fontSize:'0.75rem',color:'#00c896',fontWeight:600}}>✓ Valid UK number</span>
            )}
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label>Password *</label>
            <div className={styles.passwordWrap}>
              <input
                type={showPw ? 'text' : 'password'} placeholder="Min. 8 chars, 1 uppercase, 1 number"
                value={form.password} onChange={e => set('password', e.target.value)}
                className={errors.password ? styles.inputError : ''}
              />
              <EyeIcon show={showPw} toggle={() => setShowPw(s => !s)} />
            </div>
            <FieldError msg={errors.password} />
            <PasswordStrength password={form.password} />
          </div>

          {/* Confirm password */}
          <div className={styles.fieldGroup}>
            <label>Confirm Password *</label>
            <div className={styles.passwordWrap}>
              <input
                type={showCp ? 'text' : 'password'} placeholder="Re-enter your password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? styles.inputError : ''}
              />
              <EyeIcon show={showCp} toggle={() => setShowCp(s => !s)} />
            </div>
            <FieldError msg={errors.confirmPassword} />
            {form.confirmPassword && form.password === form.confirmPassword && (
              <span style={{fontSize:'0.75rem',color:'#00c896',fontWeight:600}}>✓ Passwords match</span>
            )}
          </div>

          <label className={styles.agreeRow}>
            <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors(er => ({...er, agreed:''})); }} />
            <span>I agree to the <a href="#terms" onClick={e=>e.preventDefault()}>Terms of Service</a> and <a href="#privacy" onClick={e=>e.preventDefault()}>Privacy Policy</a></span>
          </label>
          <FieldError msg={errors.agreed} />

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Creating account…' : `Create ${form.role === 'venue_owner' ? 'Venue Owner' : ''} Account`}
          </button>
        </form>

        <p className={styles.switchLine}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!validateEmail(email)) { setError('Enter a valid Gmail address (e.g. you@gmail.com)'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data.resetToken) setDevToken(res.data.resetToken); // dev only
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  if (sent) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>📬</div>
        <h1>Check your inbox</h1>
        <p className={styles.subtitle}>If an account exists for <strong>{email}</strong>, a password reset link has been sent. Check your spam folder if you don't see it within a minute.</p>

        {devToken && (
          <div className={styles.devTokenBox}>
            <div className={styles.devLabel}>🛠 Dev mode — reset link (no email sent)</div>
            <Link to={`/reset-password/${devToken}`} className={styles.devLink}>Click here to reset password →</Link>
          </div>
        )}

        <div className={styles.formActions}>
          <button className={styles.outlineBtn} onClick={() => { setSent(false); setEmail(''); setDevToken(''); }}>Try a different email</button>
          <Link to="/login" className={styles.submitBtn} style={{display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none'}}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>🔑</div>
        <h1>Forgot Password?</h1>
        <p className={styles.subtitle}>Enter your registered email and we'll send you a reset link valid for 15 minutes.</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <div className={styles.alertError}>⚠ {error}</div>}
          <div className={styles.fieldGroup}>
            <label>Email Address</label>
            <input type="email" placeholder="you@gmail.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} className={error ? styles.inputError : ''} />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <p className={styles.switchLine}><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );
}

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const { token }    = useParams();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw]   = useState(false);
  const [showCp, setShowCp]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); };

  const validate = () => {
    const errs = {};
    const pwErr = validatePassword(form.password);
    if (!form.password) errs.password = 'Password is required';
    else if (pwErr) errs.password = pwErr;
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, form);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — the link may have expired');
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className={styles.page}>
      <div className={styles.card} style={{textAlign:'center'}}>
        <div className={styles.successIcon}>✅</div>
        <h1>Password Reset!</h1>
        <p className={styles.subtitle}>Your password has been updated successfully. Redirecting you to sign in…</p>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>🔐</div>
        <h1>Set New Password</h1>
        <p className={styles.subtitle}>Choose a strong new password for your account.</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label>New Password *</label>
            <div className={styles.passwordWrap}>
              <input type={showPw?'text':'password'} placeholder="Min. 8 chars, 1 uppercase, 1 number" value={form.password} onChange={e=>set('password',e.target.value)} className={errors.password?styles.inputError:''} />
              <EyeIcon show={showPw} toggle={()=>setShowPw(s=>!s)} />
            </div>
            <FieldError msg={errors.password} />
            <PasswordStrength password={form.password} />
          </div>

          <div className={styles.fieldGroup}>
            <label>Confirm New Password *</label>
            <div className={styles.passwordWrap}>
              <input type={showCp?'text':'password'} placeholder="Re-enter new password" value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} className={errors.confirmPassword?styles.inputError:''} />
              <EyeIcon show={showCp} toggle={()=>setShowCp(s=>!s)} />
            </div>
            <FieldError msg={errors.confirmPassword} />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        <p className={styles.switchLine}><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );
}

// ─── VERIFY EMAIL PAGE ────────────────────────────────────────────────────────
export function VerifyEmailPage() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const [status, setStatus]       = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage]     = useState('');
  const [countdown, setCountdown] = useState(5);
  // Guard against React StrictMode double-invocation which would consume the
  // token on the first call and make the second call fail as "expired".
  const called = React.useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    if (!token) { setStatus('error'); setMessage('Invalid verification link.'); return; }
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  // Start countdown only after success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) { navigate('/login'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  if (status === 'loading') return (
    <div className={styles.page}>
      <div className={styles.card} style={{textAlign:'center'}}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>⏳</div>
        <h1>Verifying your email…</h1>
        <p className={styles.subtitle}>Please wait a moment.</p>
      </div>
    </div>
  );

  if (status === 'success') return (
    <div className={styles.page}>
      <div className={styles.card} style={{textAlign:'center'}}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>✅</div>
        <h1>Email Verified!</h1>
        <p className={styles.subtitle}>
          Your email has been verified successfully.<br/>
          You will be directed to the login page in{' '}
          <strong style={{color:'var(--accent)'}}>{countdown}</strong> second{countdown !== 1 ? 's' : ''}…
        </p>
        <Link
          to="/login"
          className={styles.submitBtn}
          style={{display:'inline-flex',alignItems:'center',justifyContent:'center',textDecoration:'none',marginTop:'1.25rem'}}
        >
          Go to Login Now
        </Link>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{textAlign:'center'}}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>❌</div>
        <h1>Verification Failed</h1>
        <p className={styles.subtitle}>{message}</p>
        <Link to="/resend-verification" className={styles.submitBtn} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',textDecoration:'none',marginTop:'1rem'}}>
          Resend Verification Email
        </Link>
        <p className={styles.switchLine} style={{marginTop:'1rem'}}><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );
}

// ─── RESEND VERIFICATION PAGE ─────────────────────────────────────────────────
export function ResendVerificationPage() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!validateEmail(email)) { setError('Enter a valid Gmail address (e.g. you@gmail.com)'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  if (sent) return (
    <div className={styles.page}>
      <div className={styles.card} style={{textAlign:'center'}}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>📬</div>
        <h1>Link Sent!</h1>
        <p className={styles.subtitle}>If <strong>{email}</strong> has an unverified account, a new verification link has been sent. Please check your inbox.</p>
        <p className={styles.switchLine}><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoArea}><Link to="/" className={styles.logo}><span>⬡</span> VenueBook</Link></div>
        <div className={styles.successIcon}>📧</div>
        <h1>Resend Verification</h1>
        <p className={styles.subtitle}>Enter your Gmail address and we'll send a new verification link.</p>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <div className={styles.alertError}>⚠ {error}</div>}
          <div className={styles.fieldGroup}>
            <label>Gmail Address</label>
            <input type="email" placeholder="you@gmail.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} className={error ? styles.inputError : ''} />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Sending…' : 'Resend Verification Link'}
          </button>
        </form>
        <p className={styles.switchLine}><Link to="/login">← Back to Sign In</Link></p>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { emailLogin, googleLogin, getCurrentUser } from "../services/auth";
import { toast } from "sonner";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../config/firebase";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiExclamationCircle,
  HiCheckCircle,
} from "react-icons/hi";

const fontStyle = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
* { font-family: 'DM Sans', 'Segoe UI', sans-serif; box-sizing: border-box; }
input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; outline: none; }
button:hover:not(:disabled) { opacity: 0.88; }
`;

export function Login() {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await emailLogin(email, password);

      if (response.message === "Login successful") {
        const userData = await getCurrentUser();
        login(userData);
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email or password";

      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setServerError("");
    setSocialLoading("Google");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      await googleLogin(idToken);

      const userData = await getCurrentUser();
      login(userData);
      toast.success("Successfully logged in");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Login Error:", error);

      if (error.code !== "auth/popup-closed-by-user") {
        setServerError("Failed to sign in with Google");
        toast.error("Failed to sign in with Google");
      }
    } finally {
      setSocialLoading("");
    }
  };

  const handleFacebookLogin = async () => {
    setServerError("");
    setSocialLoading("Facebook");

    try {
      const result = await signInWithPopup(auth, FacebookAuthProvider);
      const idToken = await result.user.getIdToken();

      await googleLogin(idToken);

      const userData = await getCurrentUser();
      login(userData);
      toast.success("Successfully logged in");
      navigate("/dashboard");
    } catch (error) {
      console.error("Facebook Login Error:", error);

      if (error.code !== "auth/popup-closed-by-user") {
        setServerError("Failed to sign in with Facebook");
        toast.error("Failed to sign in with Facebook");
      }
    } finally {
      setSocialLoading("");
    }
  };

  return (
    <>
      <style>{fontStyle}</style>
      <div style={css.page}>
        <div style={css.leftPanel}>
          <div style={css.leftInner}>
            <div style={css.circleTopRight} />
            <div style={css.circleMidLeft} />
            <div style={css.circleBottomRight} />
            <div style={css.circleSmall} />

            <div style={css.leftContent}>
              <div style={css.leftLogo}>
                <div style={css.leftLogoMark}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>SC</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                  Smart Campus
                </span>
              </div>

              <h2 style={css.leftHeading}>Welcome Back!</h2>
              <p style={css.leftSubtext}>
                Sign in to manage your campus resources, track requests, and stay
                connected with your university community.
              </p>

              <div style={css.leftBadge}>
                <HiCheckCircle size={16} color="#fff" />
                <span>Secure campus portal access</span>
              </div>
            </div>
          </div>
        </div>

        <div style={css.rightPanel}>
          <div style={css.formCard}>
            <div style={css.logoRow}>
              <div style={css.logoMark}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>SC</span>
              </div>
              <span style={css.logoText}>Smart Campus</span>
            </div>

            <h1 style={css.title}>Sign in</h1>
            <p style={css.subtitle}>Enter your credentials to continue</p>

            {serverError && (
              <div style={css.serverError}>
                <HiExclamationCircle size={16} color="#dc2626" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleEmailLogin} noValidate>
              <div style={css.fieldGroup}>
                <label style={css.label}>Email address</label>
                <div style={css.inputWrap}>
                  <span style={css.inputIcon}>
                    <HiOutlineMail size={16} color="#94a3b8" />
                  </span>
                  <input
                    style={{ ...css.input, ...(errors.email ? css.inputErr : {}) }}
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p style={css.errText}>{errors.email}</p>}
              </div>

              <div style={css.fieldGroup}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label style={css.label}>Password</label>
                  <Link to="/forgot-password" style={css.forgotLink}>
                    Forgot password?
                  </Link>
                </div>

                <div style={css.inputWrap}>
                  <span style={css.inputIcon}>
                    <HiOutlineLockClosed size={16} color="#94a3b8" />
                  </span>
                  <input
                    style={{ ...css.input, ...(errors.password ? css.inputErr : {}) }}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={css.eyeBtn}
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff size={16} color="#94a3b8" />
                    ) : (
                      <HiOutlineEye size={16} color="#94a3b8" />
                    )}
                  </button>
                </div>
                {errors.password && <p style={css.errText}>{errors.password}</p>}
              </div>

              <button
                type="submit"
                style={{ ...css.submitBtn, ...(loading ? css.submitDisabled : {}) }}
                disabled={loading || !!socialLoading}
              >
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <div style={css.divider}>
              <span style={css.divLine} />
              <span style={css.divText}>OR</span>
              <span style={css.divLine} />
            </div>

            <button
              type="button"
              style={css.socialBtn}
              onClick={handleGoogleLogin}
              disabled={loading || !!socialLoading}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {socialLoading === "Google" ? "Connecting Google…" : "Continue with Google"}
            </button>

            <button
              type="button"
              style={{ ...css.socialBtn, marginTop: "10px" }}
              onClick={handleFacebookLogin}
              disabled={loading || !!socialLoading}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.019 4.388 10.999 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953h-1.514c-1.492 0-1.956.926-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.072 24 18.092 24 12.073z" />
              </svg>
              {socialLoading === "Facebook"
                ? "Connecting Facebook…"
                : "Continue with Facebook"}
            </button>

            <p style={css.registerRow}>
              Don't have an account?{" "}
              <Link to="/register" style={css.registerLink}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const css = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    overflow: "hidden",
  },
  leftPanel: {
    width: "42%",
    minHeight: "100vh",
    background:
      "linear-gradient(145deg, #e84545 0%, #c0392b 40%, #e05c32 80%, #f08040 100%)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  leftInner: { position: "relative", zIndex: 2, padding: "3rem 2.5rem", width: "100%" },
  circleTopRight: {
    position: "absolute",
    top: "-80px",
    right: "-80px",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    pointerEvents: "none",
  },
  circleMidLeft: {
    position: "absolute",
    top: "38%",
    left: "-60px",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    pointerEvents: "none",
  },
  circleBottomRight: {
    position: "absolute",
    bottom: "-60px",
    right: "10%",
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.07)",
    pointerEvents: "none",
  },
  circleSmall: {
    position: "absolute",
    top: "22%",
    right: "15%",
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    pointerEvents: "none",
  },
  leftContent: { position: "relative", zIndex: 3 },
  leftLogo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: "3rem",
  },
  leftLogoMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  leftHeading: {
    fontSize: 34,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 14,
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
  },
  leftSubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.65,
    marginBottom: 32,
    maxWidth: 300,
  },
  leftBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(6px)",
    borderRadius: 30,
    padding: "7px 14px",
    fontSize: 13,
    color: "#fff",
    fontWeight: 500,
    border: "1px solid rgba(255,255,255,0.2)",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: "2rem 1.5rem",
    overflowY: "auto",
  },
  formCard: {
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #e8edf2",
    padding: "2.5rem 2.25rem",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 40px rgba(0,0,0,0.06)",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #1e293b, #334155)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(30,41,59,0.3)",
  },
  logoText: { fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" },
  title: { fontSize: 26, fontWeight: 700, color: "#0f172a", marginBottom: 4, letterSpacing: "-0.5px" },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: "1.75rem" },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  fieldGroup: { marginBottom: "1.1rem" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: 11,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px 40px 10px 36px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    background: "#f8fafc",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputErr: { borderColor: "#f87171", background: "#fff5f5" },
  eyeBtn: {
    position: "absolute",
    right: 10,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 2,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },
  errText: { fontSize: 12, color: "#dc2626", marginTop: 4 },
  forgotLink: { fontSize: 13, color: "#3b82f6", textDecoration: "none", fontWeight: 500 },
  submitBtn: {
    width: "100%",
    padding: "11px",
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    marginTop: 4,
    letterSpacing: "0.01em",
    boxShadow: "0 2px 12px rgba(15,23,42,0.3)",
    transition: "opacity 0.2s, transform 0.1s",
  },
  submitDisabled: { opacity: 0.65, cursor: "not-allowed" },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "1.25rem 0" },
  divLine: { flex: 1, height: 1, background: "#e2e8f0" },
  divText: { fontSize: 12, color: "#94a3b8", fontWeight: 500 },
  socialBtn: {
    width: "100%",
    padding: "10px",
    background: "#fff",
    color: "#374151",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  serverError: {
    background: "#fef2f2",
    border: "1.5px solid #fecaca",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#dc2626",
    marginBottom: "1.1rem",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  registerRow: { textAlign: "center", marginTop: "1.25rem", fontSize: 13, color: "#64748b" },
  registerLink: { color: "#3b82f6", textDecoration: "none", fontWeight: 600 },
};

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiOutlineEye, HiOutlineEyeOff, HiExclamationCircle } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import OtpInput from "../../components/OtpInput";

const fontStyle = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
* { font-family: 'DM Sans', 'Segoe UI', sans-serif; box-sizing: border-box; }
input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; outline: none; }
button:hover:not(:disabled) { opacity: 0.88; }
`;

const API = "http://localhost:8080/api/auth";

// steps: "email" | "otp" | "newPassword" | "done"

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwError, setPwError] = useState("");
    const [pwVisible, setPwVisible] = useState(false);
    const [cpwVisible, setCpwVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (step !== "otp") return;

        setResendTimer(60);
        setCanResend(false);

        const id = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [step]);

    async function handleSendOtp(e) {
        e.preventDefault();

        if (!email.trim()) {
            setEmailError("Please enter your email address.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setEmailError("");

        try {
            await axios.post(`${API}/forgot-password/send-otp`, {
                email: email.trim().toLowerCase(),
            });
            setStep("otp");
        } catch (err) {
            setEmailError(err.response?.data?.message || "Could not send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp() {
        if (otp.length < 6) {
            setOtpError("Please enter the complete 6-digit OTP.");
            return;
        }

        setOtpError("");
        setLoading(true);

        try {
            await axios.post(`${API}/forgot-password/verify-otp`, {
                email: email.trim().toLowerCase(),
                otp,
            });
            setStep("newPassword");
        } catch (err) {
            setOtpError(err.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (!canResend) return;

        setOtpError("");

        try {
            await axios.post(`${API}/forgot-password/send-otp`, {
                email: email.trim().toLowerCase(),
            });
            setResendTimer(60);
            setCanResend(false);
        } catch (err) {
            setOtpError(err.response?.data?.message || "Could not resend. Please try again.");
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();

        if (!newPassword || newPassword.length < 8) {
            setPwError("Password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPwError("Passwords do not match.");
            return;
        }

        if (otp.length < 6) {
            setPwError("OTP is missing or invalid. Please verify OTP again.");
            return;
        }

        setPwError("");
        setLoading(true);

        try {
            await axios.post(`${API}/forgot-password/reset`, {
                email: email.trim().toLowerCase(),
                otp,
                newPassword,
            });
            setStep("done");
        } catch (err) {
            setPwError(err.response?.data?.message || "Could not reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{fontStyle}</style>
            <div style={S.page}>
                {/* Left Panel */}
                <div style={S.leftPanel}>
                    <div style={S.leftInner}>
                        <div style={S.circleTopRight} />
                        <div style={S.circleMidLeft} />
                        <div style={S.circleBottomRight} />
                        <div style={S.circleSmall} />
                        <div style={S.leftContent}>
                            <div style={S.leftLogo}>
                                <div style={S.leftLogoMark}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>SC</span>
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Smart Campus</span>
                            </div>

                            <h2 style={S.leftHeading}>
                                {step === "email" && "Forgot your password?"}
                                {step === "otp" && "Check your inbox"}
                                {step === "newPassword" && "Create new password"}
                                {step === "done" && "All done!"}
                            </h2>

                            <p style={S.leftSubtext}>
                                {step === "email" &&
                                    "Enter your email and we'll send you an OTP to verify your identity before resetting your password."}
                                {step === "otp" &&
                                    `A 6-digit code was sent to ${email}. Enter it to continue.`}
                                {step === "newPassword" &&
                                    "OTP verified! Now choose a strong new password for your account."}
                                {step === "done" &&
                                    "Your password has been updated. You can now sign in with your new password."}
                            </p>

                            <div style={S.leftBadge}>
                                <span>🔒</span>
                                <span>{step === "otp" ? "OTP valid for 10 minutes" : "Secure password reset"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div style={S.rightPanel}>
                    <div style={S.formCard}>
                        <div style={S.logoRow}>
                            <div style={S.logoMark}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>SC</span>
                            </div>
                            <span style={S.logoText}>Smart Campus</span>
                        </div>

                        {/* EMAIL STEP */}
                        {step === "email" && (
                            <>
                                <div style={S.iconCircle}>🔑</div>
                                <h1 style={S.title}>Reset password</h1>
                                <p style={S.subtitle}>Enter the email address linked to your account.</p>

                                <form onSubmit={handleSendOtp} noValidate>
                                    <div style={S.fieldGroup}>
                                        <label style={S.label}>Email address</label>
                                        <div style={S.inputWrap}>
                                            <span style={S.inputIcon}>
                                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </span>
                                            <input
                                                style={{ ...S.input, ...(emailError ? S.inputErr : {}) }}
                                                type="email"
                                                placeholder="your@email.com"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    setEmailError("");
                                                }}
                                                autoComplete="email"
                                                autoFocus
                                            />
                                        </div>
                                        {emailError && <p style={S.errText}>{emailError}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        style={{ ...S.submitBtn, ...(loading ? S.submitDisabled : {}) }}
                                        disabled={loading}
                                    >
                                        {loading ? "Sending OTP…" : "Send OTP →"}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* OTP STEP */}
                        {step === "otp" && (
                            <>
                                <div
                                    style={{
                                        ...S.iconCircle,
                                        background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                                        border: "1px solid #93c5fd",
                                    }}
                                >
                                    📬
                                </div>

                                <h1 style={S.title}>Enter OTP</h1>
                                <p style={S.subtitle}>
                                    Code sent to <strong style={{ color: "#0f172a" }}>{email}</strong>
                                </p>

                                {otpError && (
                                    <div style={S.serverError}>
                                        <HiExclamationCircle size={16} color="#dc2626" />
                                        <span>{otpError}</span>
                                    </div>
                                )}

                                <div style={{ marginBottom: "1.5rem" }}>
                                    <OtpInput length={6} onChange={setOtp} hasError={!!otpError} />
                                </div>

                                <button
                                    onClick={handleVerifyOtp}
                                    style={{ ...S.submitBtn, ...(loading ? S.submitDisabled : {}) }}
                                    disabled={loading}
                                >
                                    {loading ? "Verifying…" : "Verify OTP →"}
                                </button>

                                <p style={{ textAlign: "center", marginTop: "1rem", fontSize: 13, color: "#64748b" }}>
                                    Didn't receive it?{" "}
                                    {canResend ? (
                                        <button onClick={handleResend} style={S.linkBtn}>Resend OTP</button>
                                    ) : (
                                        <span style={{ color: "#94a3b8" }}>Resend in {resendTimer}s</span>
                                    )}
                                </p>

                                <button
                                    onClick={() => setStep("email")}
                                    style={{ ...S.linkBtn, display: "block", margin: "0.5rem auto 0", fontSize: 13 }}
                                >
                                    ← Change email
                                </button>
                            </>
                        )}

                        {/* NEW PASSWORD STEP */}
                        {step === "newPassword" && (
                            <>
                                <div
                                    style={{
                                        ...S.iconCircle,
                                        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                        border: "1px solid #86efac",
                                    }}
                                >
                                    🔐
                                </div>

                                <h1 style={S.title}>New password</h1>
                                <p style={S.subtitle}>Choose a strong password for your account.</p>

                                {pwError && (
                                    <div style={S.serverError}>
                                        <HiExclamationCircle size={16} color="#dc2626" />
                                        <span>{pwError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleResetPassword} noValidate>
                                    <div style={S.fieldGroup}>
                                        <label style={S.label}>New password</label>
                                        <div style={S.inputWrap}>
                                            <span style={S.inputIcon}>
                                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </span>
                                            <input
                                                type={pwVisible ? "text" : "password"}
                                                style={{ ...S.input, ...(pwError ? S.inputErr : {}) }}
                                                placeholder="Min. 8 characters"
                                                value={newPassword}
                                                onChange={(e) => {
                                                    setNewPassword(e.target.value);
                                                    setPwError("");
                                                }}
                                                autoFocus
                                            />
                                            <button type="button" onClick={() => setPwVisible((v) => !v)} style={S.eyeBtn}>
                                                {pwVisible ? (
                                                    <HiOutlineEyeOff size={15} color="#94a3b8" />
                                                ) : (
                                                    <HiOutlineEye size={15} color="#94a3b8" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={S.fieldGroup}>
                                        <label style={S.label}>Confirm new password</label>
                                        <div style={S.inputWrap}>
                                            <span style={S.inputIcon}>
                                                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </span>
                                            <input
                                                type={cpwVisible ? "text" : "password"}
                                                style={{ ...S.input, ...(pwError ? S.inputErr : {}) }}
                                                placeholder="Repeat new password"
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    setPwError("");
                                                }}
                                            />
                                            <button type="button" onClick={() => setCpwVisible((v) => !v)} style={S.eyeBtn}>
                                                {cpwVisible ? (
                                                    <HiOutlineEyeOff size={15} color="#94a3b8" />
                                                ) : (
                                                    <HiOutlineEye size={15} color="#94a3b8" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        style={{ ...S.submitBtn, ...(loading ? S.submitDisabled : {}) }}
                                        disabled={loading}
                                    >
                                        {loading ? "Updating…" : "Update password →"}
                                    </button>
                                </form>
                            </>
                        )}

                        {/* DONE STEP */}
                        {step === "done" && (
                            <>
                                <div
                                    style={{
                                        ...S.iconCircle,
                                        background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                        border: "1px solid #86efac",
                                    }}
                                >
                                    ✅
                                </div>

                                <h1 style={S.title}>Password updated!</h1>
                                <p style={S.subtitle}>Your password has been changed successfully.</p>

                                <button style={S.submitBtn} onClick={() => navigate("/login")}>
                                    Go to sign in →
                                </button>
                            </>
                        )}

                        <div style={S.divider}><span style={S.divLine} /></div>
                        <Link to="/login" style={S.backLink}>← Back to sign in</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

const S = {
    page: { minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", overflow: "hidden" },
    leftPanel: { width: "42%", minHeight: "100vh", background: "linear-gradient(145deg, #e84545 0%, #c0392b 40%, #e05c32 80%, #f08040 100%)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" },
    leftInner: { position: "relative", zIndex: 2, padding: "3rem 2.5rem", width: "100%" },
    circleTopRight: { position: "absolute", top: "-80px", right: "-80px", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" },
    circleMidLeft: { position: "absolute", top: "38%", left: "-60px", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" },
    circleBottomRight: { position: "absolute", bottom: "-60px", right: "10%", width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" },
    circleSmall: { position: "absolute", top: "22%", right: "15%", width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" },
    leftContent: { position: "relative", zIndex: 3 },
    leftLogo: { display: "flex", alignItems: "center", gap: 10, marginBottom: "3rem" },
    leftLogoMark: { width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" },
    leftHeading: { fontSize: 34, fontWeight: 700, color: "#fff", marginBottom: 14, lineHeight: 1.2, letterSpacing: "-0.5px" },
    leftSubtext: { fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.65, marginBottom: 32, maxWidth: 300 },
    leftBadge: { display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", borderRadius: 30, padding: "7px 14px", fontSize: 13, color: "#fff", fontWeight: 500, border: "1px solid rgba(255,255,255,0.2)" },
    rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "2rem 1.5rem", overflowY: "auto" },
    formCard: { background: "#fff", borderRadius: 20, border: "1px solid #e8edf2", padding: "2.5rem 2.25rem", width: "100%", maxWidth: 420, boxShadow: "0 4px 40px rgba(0,0,0,0.06)" },
    logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" },
    logoMark: { width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1e293b, #334155)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(30,41,59,0.3)" },
    logoText: { fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" },
    iconCircle: { width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#fef3c7,#fde68a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: "1.25rem", border: "1px solid #fcd34d" },
    title: { fontSize: 26, fontWeight: 700, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.5px" },
    subtitle: { fontSize: 14, color: "#64748b", marginBottom: "1.75rem", lineHeight: 1.6 },
    label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
    fieldGroup: { marginBottom: "1.25rem" },
    inputWrap: { position: "relative", display: "flex", alignItems: "center" },
    inputIcon: { position: "absolute", left: 11, pointerEvents: "none", display: "flex", alignItems: "center" },
    input: { width: "100%", padding: "10px 40px 10px 36px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" },
    inputErr: { borderColor: "#f87171", background: "#fff5f5" },
    eyeBtn: { position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" },
    errText: { fontSize: 12, color: "#dc2626", marginTop: 4 },
    submitBtn: { width: "100%", padding: "11px", background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em", boxShadow: "0 2px 12px rgba(15,23,42,0.3)", transition: "opacity 0.2s" },
    submitDisabled: { opacity: 0.65, cursor: "not-allowed" },
    serverError: { background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 },
    divider: { display: "flex", alignItems: "center", gap: 10, margin: "1.25rem 0" },
    divLine: { flex: 1, height: 1, background: "#e2e8f0" },
    backLink: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, color: "#3b82f6", textDecoration: "none", fontWeight: 600 },
    linkBtn: { background: "none", border: "none", color: "#3b82f6", fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
};

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  FiArrowLeft,
  FiEdit2,
  FiCamera,
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiShield,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { HiOutlineIdentification } from "react-icons/hi";

const fontStyle = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
* { font-family: 'DM Sans', 'Segoe UI', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; outline: none; }
button:hover:not(:disabled) { opacity: 0.9; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
`;

const BASE = "http://localhost:8080";

const ROLE_CONFIG = {
  ROLE_USER: { label: "Student", bg: "#eff6ff", color: "#1d4ed8" },
  ROLE_TECHNICIAN: { label: "Technician", bg: "#f0fdf4", color: "#15803d" },
  ROLE_MANAGER: { label: "Manager", bg: "#fdf4ff", color: "#7e22ce" },
  ROLE_ADMIN: { label: "Administrator", bg: "#fef3c7", color: "#92400e" },
};

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

function getAvatarColor(email = "") {
  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];
  return colors[(email.charCodeAt(0) || 0) % colors.length];
}

function getProviderLabel(provider) {
  if (provider === "GOOGLE") return "Google";
  if (provider === "FACEBOOK") return "Facebook";
  return "Email & Password";
}

function StrengthBar({ password }) {
  function getStrength(pw) {
    if (!pw) return -1;
    if (pw.length < 8) return 0;
    if (pw.length < 10) return 1;
    if (pw.length < 12) return 2;
    return 3;
  }

  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const s = getStrength(password);
  if (s < 0) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 4,
              background: i <= s ? colors[s] : "#e2e8f0",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 11, color: colors[s], fontWeight: 500 }}>{labels[s]}</p>
    </div>
  );
}

export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const authUser = user || {};
  const userId = authUser?.userId;
  const avatarBg = getAvatarColor(authUser?.email || "");
  const roleInfo = ROLE_CONFIG[authUser?.role] || ROLE_CONFIG.ROLE_USER;

  const [form, setForm] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
  });

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);

  const [pwMode, setPwMode] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false });

  const [toast, setToast] = useState(null);

  const displayPhoto = previewUrl || authUser?.profilePictureUrl || null;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function validateForm() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    else if (form.fullName.trim().length < 3) e.fullName = "Full name must be at least 3 characters";
    return e;
  }

  async function handleSave() {
    if (!userId) {
      showToast("Session error — please log in again", "error");
      return;
    }

    const e = validateForm();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const { data } = await axios.put(
        `${BASE}/api/users/me`,
        {
          fullName: form.fullName.trim(),
          email: form.email,
        },
        {
          headers: getAuthHeader?.() || {},
          withCredentials: true,
        }
      );

      const updatedUser = data?.user || data || { ...authUser, fullName: form.fullName.trim() };

      if (currentUser?.user) {
        login({ ...currentUser, user: { ...authUser, ...updatedUser } });
      } else {
        login({ ...authUser, ...updatedUser });
      }

      setEditMode(false);
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      fullName: authUser?.fullName || "",
      email: authUser?.email || "",
    });
    setErrors({});
    setEditMode(false);
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("Only image files are allowed", "error");
    if (file.size > 5 * 1024 * 1024) return showToast("File size must be under 5 MB", "error");
    if (!userId) return showToast("Session error — please log in again", "error");

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const { data } = await axios.post(
        `${BASE}/api/auth/upload-photo/${userId}`,
        formData,
        {
          headers: {
            ...(getAuthHeader?.() || {}),
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      const newUrl = data?.profilePictureUrl || data?.photoUrl || data?.url || null;

      if (currentUser?.user) {
        login({
          ...currentUser,
          user: {
            ...authUser,
            profilePictureUrl: newUrl || authUser?.profilePictureUrl,
          },
        });
      } else {
        login({
          ...authUser,
          profilePictureUrl: newUrl || authUser?.profilePictureUrl,
        });
      }

      setPreviewUrl(null);
      showToast("Photo updated");
    } catch (err) {
      setPreviewUrl(null);
      showToast(err.response?.data?.message || "Photo upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function validatePw() {
    const e = {};

    if (!pwForm.current) e.current = "Current password is required";

    if (!pwForm.next) e.next = "New password is required";
    else if (pwForm.next.length < 8) e.next = "Password must be at least 8 characters";
    else if (pwForm.next === pwForm.current) e.next = "New password must be different from current password";

    if (!pwForm.confirm) e.confirm = "Please confirm your new password";
    else if (pwForm.next !== pwForm.confirm) e.confirm = "Passwords do not match";

    return e;
  }

  async function handleChangePw() {
    if (!userId) {
      showToast("Session error — please log in again", "error");
      return;
    }

    const e = validatePw();
    setPwErrors(e);
    if (Object.keys(e).length) return;

    setPwSaving(true);
    try {
      await api.post("/users/change-password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });

      setPwMode(false);
      setPwForm({ current: "", next: "", confirm: "" });
      showToast("Password changed successfully. Please login again.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      showToast(err.response?.data || "Failed to change password", "error");
    } finally {
      setPwSaving(false);
    }
  }

  function cancelPw() {
    setPwMode(false);
    setPwForm({ current: "", next: "", confirm: "" });
    setPwErrors({});
    setPwVisible({ current: false, next: false, confirm: false });
  }

  return (
    <>
      <style>{fontStyle}</style>
      <div style={S.page}>
        <div style={S.bgGlowTop} />
        <div style={S.bgGlowBottom} />

        <div style={S.container}>
          <button onClick={() => navigate(-1)} style={S.backBtn}>
            <FiArrowLeft size={15} style={{ marginRight: 6 }} />
            Back
          </button>

          <div style={S.heroCard}>
            <div style={S.heroCover} />
            <div style={S.avatarSection}>
              <div style={S.avatarWrap}>
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : (
                  <div style={{ ...S.avatarFallback, background: avatarBg }}>
                    {getInitials(authUser?.fullName)}
                  </div>
                )}

                {uploading && (
                  <div style={S.uploadOverlay}>
                    <div style={S.spinner} />
                  </div>
                )}

                <button style={S.cameraBtn} onClick={() => fileRef.current?.click()} title="Change photo">
                  <FiCamera size={13} color="#fff" />
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />

              <div style={S.heroInfo}>
                <h1 style={S.heroName}>{authUser?.fullName || "—"}</h1>
                <p style={S.heroEmail}>{authUser?.email || "—"}</p>
                <span style={{ ...S.rolePill, background: roleInfo.bg, color: roleInfo.color }}>
                  {roleInfo.label}
                </span>
              </div>

              {!editMode && (
                <button onClick={() => setEditMode(true)} style={S.outlineBtn}>
                  <FiEdit2 size={13} style={{ marginRight: 6 }} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div style={S.twoCol}>
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={S.cardTitleRow}>
                  <FiUser size={16} color="#3b82f6" />
                  <h2 style={S.cardTitle}>Profile Details</h2>
                </div>

                {editMode && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleCancel} style={S.cancelBtn}>
                      <FiX size={13} style={{ marginRight: 4 }} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{ ...S.saveBtn, ...(saving ? S.disabled : {}) }}
                    >
                      <FiCheck size={13} style={{ marginRight: 4 }} />
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                )}
              </div>

              <div style={S.fieldList}>
                <div style={S.fieldRow}>
                  <label style={S.fieldLabel}>Full Name</label>
                  {editMode ? (
                    <>
                      <input
                        style={{ ...S.fieldInput, ...(errors.fullName ? S.inputErr : {}) }}
                        value={form.fullName}
                        placeholder="Enter full name"
                        onChange={(ev) => {
                          setForm((p) => ({ ...p, fullName: ev.target.value }));
                          setErrors((p) => ({ ...p, fullName: null }));
                        }}
                      />
                      {errors.fullName && <p style={S.errText}>{errors.fullName}</p>}
                    </>
                  ) : (
                    <span style={S.fieldValue}>{form.fullName || "—"}</span>
                  )}
                </div>

                <div style={S.fieldRow}>
                  <label style={S.fieldLabel}>Email Address</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FiMail size={14} color="#94a3b8" />
                    <span style={S.fieldValue}>{form.email || "—"}</span>
                  </div>
                </div>

                <div style={S.fieldRow}>
                  <label style={S.fieldLabel}>Role</label>
                  <span style={{ ...S.rolePill, fontSize: 12, background: roleInfo.bg, color: roleInfo.color }}>
                    {roleInfo.label}
                  </span>
                </div>

                <div style={S.fieldRow}>
                  <label style={S.fieldLabel}>Login Method</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FiShield size={14} color="#94a3b8" />
                    <span style={S.fieldValue}>{getProviderLabel(authUser?.provider)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={S.card}>
                <div style={S.cardTitleRow}>
                  <FiCamera size={16} color="#3b82f6" />
                  <h2 style={S.cardTitle}>Profile Photo</h2>
                </div>
                <p style={S.cardDesc}>Upload a JPG or PNG under 5 MB.</p>

                {displayPhoto && (
                  <div style={{ textAlign: "center", margin: "12px 0" }}>
                    <img
                      src={displayPhoto}
                      alt="Current"
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid #e2e8f0",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Current photo</p>
                  </div>
                )}

                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{
                    ...S.blueBtn,
                    ...(uploading ? S.disabled : {}),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <FiUpload size={14} />
                  {uploading ? "Uploading..." : "Choose Photo"}
                </button>
              </div>

              {(!authUser?.provider || authUser?.provider === "LOCAL") && (
                <div style={S.card}>
                  <div style={S.cardHeader}>
                    <div style={S.cardTitleRow}>
                      <FiLock size={16} color="#3b82f6" />
                      <h2 style={S.cardTitle}>Security</h2>
                    </div>

                    {!pwMode && (
                      <button onClick={() => setPwMode(true)} style={S.outlineBtn}>
                        Change Password
                      </button>
                    )}
                  </div>

                  {!pwMode ? (
                    <p style={S.cardDesc}>Keep your account safe with a strong password.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      {[
                        { key: "current", label: "Current Password", ph: "Enter current password" },
                        { key: "next", label: "New Password", ph: "Minimum 8 characters" },
                        { key: "confirm", label: "Confirm New Password", ph: "Repeat new password" },
                      ].map(({ key, label, ph }) => (
                        <div key={key}>
                          <label style={S.fieldLabel}>{label}</label>
                          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <input
                              type={pwVisible[key] ? "text" : "password"}
                              placeholder={ph}
                              style={{
                                ...S.fieldInput,
                                paddingRight: 38,
                                ...(pwErrors[key] ? S.inputErr : {}),
                              }}
                              value={pwForm[key]}
                              onChange={(ev) => {
                                setPwForm((p) => ({ ...p, [key]: ev.target.value }));
                                setPwErrors((p) => ({ ...p, [key]: null }));
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setPwVisible((p) => ({ ...p, [key]: !p[key] }))}
                              style={S.eyeBtn}
                            >
                              {pwVisible[key] ? (
                                <FiEyeOff size={15} color="#94a3b8" />
                              ) : (
                                <FiEye size={15} color="#94a3b8" />
                              )}
                            </button>
                          </div>
                          {pwErrors[key] && <p style={S.errText}>{pwErrors[key]}</p>}
                          {key === "next" && <StrengthBar password={pwForm.next} />}
                        </div>
                      ))}

                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button onClick={cancelPw} style={S.cancelBtn}>
                          <FiX size={13} style={{ marginRight: 4 }} /> Cancel
                        </button>
                        <button
                          onClick={handleChangePw}
                          disabled={pwSaving}
                          style={{ ...S.saveBtn, ...(pwSaving ? S.disabled : {}) }}
                        >
                          <FiCheck size={13} style={{ marginRight: 4 }} />
                          {pwSaving ? "Updating..." : "Update password"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={S.card}>
                <div style={{ ...S.cardTitleRow, marginBottom: "0.75rem" }}>
                  <HiOutlineIdentification size={17} color="#3b82f6" />
                  <h2 style={S.cardTitle}>Account Info</h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    { label: "Account ID", value: userId ? String(userId) : "—", mono: true },
                    { label: "Status", value: authUser?.enabled ? "Active" : "Disabled", green: !!authUser?.enabled },
                    { label: "Provider", value: authUser?.provider || "LOCAL" },
                  ].map(({ label, value, mono, green }) => (
                    <div key={label} style={S.infoRow}>
                      <span style={S.infoLabel}>{label}</span>
                      <span
                        style={{
                          ...S.infoValue,
                          ...(mono ? { fontFamily: "monospace", fontSize: 11 } : {}),
                          ...(green ? { color: "#15803d", fontWeight: 600 } : {}),
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div
            style={{
              ...S.toast,
              background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
              borderColor: toast.type === "error" ? "#fecaca" : "#bbf7d0",
              color: toast.type === "error" ? "#dc2626" : "#15803d",
              animation: "slideUp 0.25s ease",
            }}
          >
            {toast.type === "error" ? <FiX size={14} /> : <FiCheck size={14} />}
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}

const S = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    position: "relative",
    overflowX: "hidden",
  },
  bgGlowTop: {
    position: "fixed",
    top: -180,
    right: -180,
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.18), transparent 65%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  bgGlowBottom: {
    position: "fixed",
    bottom: -220,
    left: -180,
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(6,182,212,0.12), transparent 65%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "1.75rem 1.5rem 4rem",
    position: "relative",
    zIndex: 1,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 500,
    color: "#cbd5e1",
    cursor: "pointer",
    padding: "4px 0",
    marginBottom: "1.25rem",
  },
  heroCard: {
    background: "rgba(255,255,255,0.98)",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid rgba(226,232,240,0.7)",
    boxShadow: "0 10px 40px rgba(2,6,23,0.35)",
    marginBottom: "1.25rem",
  },
  heroCover: {
    height: 120,
    background: "linear-gradient(135deg,#1d4ed8 0%, #2563eb 45%, #06b6d4 100%)",
  },
  avatarSection: {
    display: "flex",
    alignItems: "flex-end",
    gap: "1.25rem",
    padding: "0 1.75rem 1.5rem",
    marginTop: -48,
    flexWrap: "wrap",
  },
  avatarWrap: {
    width: 94,
    height: 94,
    borderRadius: "50%",
    border: "4px solid #fff",
    background: "#f1f5f9",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
    boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    fontWeight: 700,
    color: "#fff",
  },
  uploadOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
  spinner: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    animation: "spin 0.7s linear infinite",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#0f172a",
    border: "2px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  heroInfo: {
    flex: 1,
    paddingBottom: 4,
    paddingTop: 50,
  },
  heroName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.4px",
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
  },
  rolePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: "1.25rem",
    alignItems: "start",
  },
  card: {
    background: "rgba(255,255,255,0.98)",
    borderRadius: 16,
    padding: "1.5rem",
    border: "1px solid rgba(226,232,240,0.7)",
    boxShadow: "0 8px 28px rgba(2,6,23,0.18)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.25rem",
  },
  cardTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },
  cardDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.55,
    margin: "4px 0 14px",
  },
  fieldList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  fieldRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  fieldValue: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: 500,
  },
  fieldInput: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    background: "#f8fafc",
    transition: "border-color 0.2s",
  },
  inputErr: {
    borderColor: "#f87171",
    background: "#fff5f5",
  },
  errText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 3,
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    padding: "7px 16px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg,#1e293b,#0f172a)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(15,23,42,0.25)",
  },
  cancelBtn: {
    display: "flex",
    alignItems: "center",
    padding: "7px 16px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
  outlineBtn: {
    display: "flex",
    alignItems: "center",
    padding: "7px 14px",
    borderRadius: 9,
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  blueBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: 9,
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(29,78,216,0.3)",
  },
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
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  infoLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 500,
  },
  infoValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: 500,
  },
  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    padding: "11px 18px",
    borderRadius: 10,
    border: "1.5px solid",
    fontSize: 13,
    fontWeight: 500,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};

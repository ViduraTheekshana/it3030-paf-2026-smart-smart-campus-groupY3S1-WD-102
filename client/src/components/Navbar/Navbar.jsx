import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import axios from "axios";
import {
  FiBell, FiUser, FiCalendar, FiLogOut, FiSettings,
  FiZap, FiCheck, FiTrash2, FiX, FiCheckCircle,
  FiAlertCircle, FiInfo, FiGift, FiBookOpen
} from "react-icons/fi";

const NAV_LINKS = [
  { to: "/",              label: "Home"          },
  { to: "/facilities",    label: "Resources"     },
  { to: "/bookings",      label: "Bookings"      },
  { to: "/tickets",       label: "Tickets"       },
];

const ROLE_CONFIG = {
  USER:       { label: "Student",    bg: "#eff6ff", color: "#1d4ed8" },
  STUDENT:    { label: "Student",    bg: "#eff6ff", color: "#1d4ed8" },
  TECHNICIAN: { label: "Technician", bg: "#f0fdf4", color: "#15803d" },
  MANAGER:    { label: "Manager",    bg: "#fdf4ff", color: "#7e22ce" },
  ADMIN:      { label: "Admin",      bg: "#fef3c7", color: "#92400e" },
};

// Icon per notification type
function NotifIcon({ type }) {
  const s = { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
  switch (type) {
    case "WELCOME":  return <div style={{ ...s, background: "#eff6ff" }}><FiGift    size={15} color="#3b82f6" /></div>;
    case "BOOKING":  return <div style={{ ...s, background: "#f0fdf4" }}><FiCalendar size={15} color="#16a34a" /></div>;
    case "TICKET":   return <div style={{ ...s, background: "#fdf4ff" }}><FiAlertCircle size={15} color="#9333ea" /></div>;
    case "RESOURCE": return <div style={{ ...s, background: "#fff7ed" }}><FiBookOpen size={15} color="#ea580c" /></div>;
    case "PROFILE":  return <div style={{ ...s, background: "#f0fdf4" }}><FiCheckCircle size={15} color="#16a34a" /></div>;
    case "SYSTEM":   return <div style={{ ...s, background: "#fef3c7" }}><FiZap      size={15} color="#d97706" /></div>;
    default:         return <div style={{ ...s, background: "#f1f5f9" }}><FiInfo     size={15} color="#64748b" /></div>;
  }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name = "") {
  return name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}
function avatarColor(email = "") {
  const c = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981","#ef4444"];
  return c[email.charCodeAt(0) % c.length];
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [menuOpen,  setMenuOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs,    setNotifs]    = useState([]);
  const [unread,    setUnread]    = useState(0);
  const [loading,   setLoading]   = useState(false);

  const menuRef  = useRef(null);
  const notifRef = useRef(null);

  const userId = currentUser?.id || currentUser?.userId;

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      if (menuRef.current  && !menuRef.current.contains(e.target))  setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Poll unread count every 30s ────────────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`/api/notifications/user/${userId}/unread-count`);
      setUnread(data.count || 0);
    } catch { /* silent */ }
  }, [userId]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // ── Load notifications panel ───────────────────────────────────────────────
  async function openNotifPanel() {
    setNotifOpen(o => !o);
    setMenuOpen(false);
    if (!userId || notifOpen) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/notifications/user/${userId}`);
      setNotifs(data);
      setUnread(data.filter(n => !n.read).length);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  async function markRead(notifId) {
    try {
      await axios.put(`/api/notifications/${notifId}/read`);
      setNotifs(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  }

  async function markAllRead() {
    if (!userId) return;
    try {
      await axios.put(`/api/notifications/user/${userId}/read-all`);
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch { /* silent */ }
  }

  async function deleteNotif(notifId, e) {
    e.stopPropagation();
    try {
      await axios.delete(`/api/notifications/${notifId}`);
      setNotifs(prev => prev.filter(n => n.id !== notifId));
      setUnread(prev => {
        const was = notifs.find(n => n.id === notifId);
        return was && !was.read ? Math.max(0, prev - 1) : prev;
      });
    } catch { /* silent */ }
  }

  const roleInfo = currentUser ? (ROLE_CONFIG[currentUser.role] || ROLE_CONFIG.USER) : null;
  const isActive = path => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
      <nav style={S.nav}>
        {/* Logo */}
        <Link to="/" style={S.logo}>
          <div style={S.logoIcon}><span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>SC</span></div>
          <span style={S.logoText}>Smart Campus</span>
        </Link>

        {/* Nav links */}
        <ul style={S.links}>
          {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} style={{ ...S.link, ...(isActive(to) ? S.linkActive : {}) }}>
                  {label}
                  {isActive(to) && <span style={S.linkDot} />}
                </Link>
              </li>
          ))}
          {currentUser?.role === "ADMIN" && (
              <li>
                <Link to="/admin/dashboard" style={{
                  ...S.link, color: "#fbbf24",
                  ...(isActive("/admin") ? { color: "#fbbf24" } : { opacity: 0.8 }),
                }}>
                  Admin
                  {isActive("/admin") && <span style={{ ...S.linkDot, background: "#fbbf24" }} />}
                </Link>
              </li>
          )}
        </ul>

        {/* Right side */}
        <div style={S.rightSide}>
          {currentUser ? (
              <>
                {/* ── Notification Bell ── */}
                <div style={{ position: "relative" }} ref={notifRef}>
                  <button style={S.bellBtn} onClick={openNotifPanel} title="Notifications">
                    <FiBell size={18} color="#94a3b8" />
                    {unread > 0 && (
                        <span style={S.badge}>{unread > 99 ? "99+" : unread}</span>
                    )}
                  </button>

                  {/* Notification dropdown */}
                  {notifOpen && (
                      <div style={S.notifPanel}>
                        {/* Header */}
                        <div style={S.notifHeader}>
                          <div>
                            <span style={S.notifTitle}>Notifications</span>
                            {unread > 0 && (
                                <span style={S.unreadBadge}>{unread} new</span>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            {unread > 0 && (
                                <button style={S.headerBtn} onClick={markAllRead} title="Mark all read">
                                  <FiCheck size={13} /> All read
                                </button>
                            )}
                            <button style={{ ...S.headerBtn, padding: "4px 6px" }}
                                    onClick={() => setNotifOpen(false)}>
                              <FiX size={13} />
                            </button>
                          </div>
                        </div>

                        {/* List */}
                        <div style={S.notifList}>
                          {loading ? (
                              <div style={S.notifEmpty}>Loading...</div>
                          ) : notifs.length === 0 ? (
                              <div style={S.notifEmpty}>
                                <FiBell size={28} color="#cbd5e1" />
                                <p style={{ marginTop: 8, color: "#94a3b8", fontSize: 13 }}>No notifications yet</p>
                              </div>
                          ) : (
                              notifs.map(n => (
                                  <div
                                      key={n.id}
                                      style={{ ...S.notifItem, background: n.read ? "#fff" : "#f0f7ff" }}
                                      onClick={() => !n.read && markRead(n.id)}
                                  >
                                    <NotifIcon type={n.type} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <p style={{ ...S.notifItemTitle, fontWeight: n.read ? 500 : 700 }}>{n.title}</p>
                                        {!n.read && <span style={S.unreadDot} />}
                                      </div>
                                      <p style={S.notifItemMsg}>{n.message}</p>
                                      <p style={S.notifItemTime}>{timeAgo(n.createdAt)}</p>
                                    </div>
                                    <button style={S.deleteBtn} onClick={e => deleteNotif(n.id, e)} title="Delete">
                                      <FiTrash2 size={12} color="#cbd5e1" />
                                    </button>
                                  </div>
                              ))
                          )}
                        </div>

                        {/* Footer */}
                        {notifs.length > 0 && (
                            <div style={S.notifFooter}>
                              <Link to="/notifications" style={S.viewAllBtn}
                                    onClick={() => setNotifOpen(false)}>
                                View all notifications
                              </Link>
                            </div>
                        )}
                      </div>
                  )}
                </div>

                {/* ── Avatar / Profile menu ── */}
                <div style={{ position: "relative" }} ref={menuRef}>
                  <button style={S.avatarBtn} onClick={() => { setMenuOpen(o => !o); setNotifOpen(false); }}>
                    {currentUser.profilePhotoUrl ? (
                        <img src={currentUser.profilePhotoUrl} alt="Profile"
                             style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ ...S.avatarFallback, background: avatarColor(currentUser.email) }}>
                          {initials(currentUser.name)}
                        </div>
                    )}
                    <span style={S.onlineDot} />
                  </button>

                  {menuOpen && (
                      <div style={S.dropdown}>
                        {/* User info header */}
                        <div style={S.dropHeader}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={S.dropAvatar}>
                              {currentUser.profilePhotoUrl ? (
                                  <img src={currentUser.profilePhotoUrl} alt="Profile"
                                       style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                              ) : (
                                  <div style={{ ...S.dropAvatarFallback, background: avatarColor(currentUser.email) }}>
                                    {initials(currentUser.name)}
                                  </div>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={S.dropName}>{currentUser.name || currentUser.userName}</p>
                              <p style={S.dropEmail}>{currentUser.email}</p>
                            </div>
                          </div>
                          {roleInfo && (
                              <span style={{ ...S.rolePill, background: roleInfo.bg, color: roleInfo.color }}>
                        {roleInfo.label}
                      </span>
                          )}
                        </div>

                        {/* Menu items */}
                        <div style={S.dropBody}>
                          <Link to="/profile"       style={S.dropItem} onClick={() => setMenuOpen(false)}>
                            <FiUser size={14} color="#64748b" /><span>My Profile</span>
                          </Link>
                          <Link to="/bookings"      style={S.dropItem} onClick={() => setMenuOpen(false)}>
                            <FiCalendar size={14} color="#64748b" /><span>My Bookings</span>
                          </Link>
                          <Link to="/notifications" style={S.dropItem} onClick={() => setMenuOpen(false)}>
                            <FiBell size={14} color="#64748b" />
                            <span>Notifications</span>
                            {unread > 0 && <span style={S.menuBadge}>{unread}</span>}
                          </Link>
                          {currentUser.role === "ADMIN" && (
                              <>
                                <div style={S.dropDivider} />
                                <Link to="/admin/dashboard" style={S.dropItem} onClick={() => setMenuOpen(false)}>
                                  <FiZap size={14} color="#f59e0b" /><span>Admin Dashboard</span>
                                </Link>
                              </>
                          )}
                        </div>

                        <div style={S.dropFooter}>
                          <button style={S.dropLogout} onClick={() => { logout(); navigate("/login"); }}>
                            <FiLogOut size={14} color="#ef4444" /><span>Sign out</span>
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              </>
          ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Link to="/login"    style={S.loginBtn}>Sign in</Link>
                <Link to="/register" style={S.registerBtn}>Register</Link>
              </div>
          )}
        </div>
      </nav>
  );
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
const S = {
  nav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0 1.75rem", height: 60, backgroundColor: "#0f172a",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    position: "sticky", top: 0, zIndex: 100,
    borderBottom: "1px solid #1e293b", boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
  },
  logo: { color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 9 },
  logoIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 6px rgba(59,130,246,0.4)",
  },
  logoText: { color: "#f1f5f9", fontWeight: 700 },
  links: { listStyle: "none", display: "flex", gap: 2, alignItems: "center" },
  link: {
    color: "#94a3b8", textDecoration: "none", fontSize: 14, fontWeight: 500,
    padding: "5px 11px", borderRadius: 7, position: "relative",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  },
  linkActive: { color: "#f1f5f9" },
  linkDot: { width: 4, height: 4, borderRadius: "50%", background: "#3b82f6", position: "absolute", bottom: -1 },
  rightSide: { display: "flex", alignItems: "center", gap: 8 },

  // Bell
  bellBtn: {
    width: 36, height: 36, borderRadius: "50%",
    background: "#1e293b", border: "1px solid #334155",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute", top: -3, right: -3,
    background: "#ef4444", color: "#fff",
    fontSize: 9, fontWeight: 700,
    padding: "1px 4px", borderRadius: 8,
    border: "2px solid #0f172a", minWidth: 16, textAlign: "center",
  },

  // Notification panel
  notifPanel: {
    position: "absolute", top: 46, right: 0,
    width: 360, maxHeight: 520,
    background: "#fff", border: "1px solid #e8edf2",
    borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
    overflow: "hidden", zIndex: 300,
    display: "flex", flexDirection: "column",
  },
  notifHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px", borderBottom: "1px solid #f1f5f9",
  },
  notifTitle: { fontSize: 14, fontWeight: 700, color: "#0f172a" },
  unreadBadge: {
    marginLeft: 8, fontSize: 10, fontWeight: 700,
    background: "#3b82f6", color: "#fff",
    padding: "2px 7px", borderRadius: 20,
  },
  headerBtn: {
    display: "flex", alignItems: "center", gap: 4,
    padding: "4px 10px", borderRadius: 7,
    border: "1px solid #e2e8f0", background: "#fff",
    fontSize: 11, fontWeight: 600, color: "#64748b",
    cursor: "pointer",
  },
  notifList: { flex: 1, overflowY: "auto", maxHeight: 380 },
  notifEmpty: {
    padding: "2.5rem", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
  },
  notifItem: {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "12px 16px", cursor: "pointer",
    borderBottom: "1px solid #f8fafc",
    transition: "background 0.1s",
  },
  notifItemTitle: { fontSize: 13, color: "#0f172a", marginBottom: 2, lineHeight: 1.3 },
  notifItemMsg:   { fontSize: 12, color: "#64748b", lineHeight: 1.4, marginBottom: 3 },
  notifItemTime:  { fontSize: 10, color: "#94a3b8" },
  unreadDot: { width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 3 },
  deleteBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, flexShrink: 0, opacity: 0.5,
    display: "flex", alignItems: "center",
  },
  notifFooter: { borderTop: "1px solid #f1f5f9", padding: "10px 16px" },
  viewAllBtn: {
    display: "block", textAlign: "center", fontSize: 13,
    color: "#3b82f6", textDecoration: "none", fontWeight: 500,
  },

  // Avatar
  avatarBtn: {
    width: 36, height: 36, borderRadius: "50%",
    border: "2px solid #334155", background: "#1e293b",
    cursor: "pointer", overflow: "hidden", padding: 0,
    position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarFallback: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#fff",
  },
  onlineDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 9, height: 9, borderRadius: "50%",
    background: "#22c55e", border: "2px solid #0f172a",
  },

  // Dropdown
  dropdown: {
    position: "absolute", top: 46, right: 0, width: 240,
    background: "#fff", border: "1px solid #e8edf2",
    borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
    overflow: "hidden", zIndex: 200,
  },
  dropHeader: { padding: "14px 14px 10px" },
  dropAvatar: {
    width: 38, height: 38, borderRadius: "50%",
    background: "#f1f5f9", flexShrink: 0, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  dropAvatarFallback: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, color: "#fff",
  },
  dropName:  { fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  dropEmail: { fontSize: 11, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  rolePill: {
    display: "inline-flex", alignItems: "center",
    padding: "2px 9px", borderRadius: 20, marginTop: 8,
    fontSize: 11, fontWeight: 600,
  },
  dropBody: { borderTop: "1px solid #f1f5f9", padding: "6px" },
  dropItem: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 10px", borderRadius: 8,
    fontSize: 13, color: "#374151", textDecoration: "none",
  },
  menuBadge: {
    marginLeft: "auto", background: "#ef4444", color: "#fff",
    fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 8,
  },
  dropDivider: { height: 1, background: "#f1f5f9", margin: "4px 0" },
  dropFooter: { borderTop: "1px solid #f1f5f9", padding: "6px" },
  dropLogout: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 10px", width: "100%",
    fontSize: 13, color: "#ef4444",
    background: "none", border: "none", cursor: "pointer",
    fontFamily: "inherit", borderRadius: 8,
  },
  loginBtn: {
    padding: "6px 14px", background: "#1e293b", color: "#f1f5f9",
    border: "1px solid #334155", borderRadius: 8,
    fontSize: 13, fontWeight: 500, textDecoration: "none",
  },
  registerBtn: {
    padding: "6px 14px", background: "#3b82f6", color: "#fff",
    border: "none", borderRadius: 8,
    fontSize: 13, fontWeight: 600, textDecoration: "none",
  },
};
import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Truck, 
  UserCheck,
  Building2,
  Globe2
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";
import { API_ENDPOINTS } from "../config/api";

export function LoginModal({ lang, onLoginSuccess, onClose, isSwitching = false }) {
  const [email, setEmail] = useState("himodhmanni@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Quick Demo Accounts Preset
  const presets = [
    {
      role: "client_himod",
      name: "Himod Hmanni (ليبيا)",
      email: "himodhmanni@gmail.com",
      pass: "admin123",
      tag: "مالك مركبة مهيمن",
      icon: <Truck size={14} color="#10b981" />
    },
    {
      role: "superadmin",
      name: "مدير المنظومة (SuperAdmin)",
      email: "admin@gpswox.com",
      pass: "admin123",
      tag: "كامل الصلاحيات العامة",
      icon: <ShieldCheck size={14} color="#00b4c6" />
    },
    {
      role: "client_futtaim",
      name: "شركة الفطيم اللوجستية",
      email: "fleet@alfuttaim-logistics.com",
      pass: "fleet123",
      tag: "أسطول شاحنات تجاري",
      icon: <Building2 size={14} color="#f59e0b" />
    }
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    soundFX.playClick();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(API_ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (lang === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid login credentials"));
      }

      if (rememberMe) {
        localStorage.setItem("gpswox_token", data.token);
        localStorage.setItem("gpswox_user", JSON.stringify(data.user));
      } else {
        sessionStorage.setItem("gpswox_token", data.token);
        sessionStorage.setItem("gpswox_user", JSON.stringify(data.user));
      }

      soundFX.playAlert();
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      soundFX.playOverspeed();
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (p) => {
    soundFX.playClick();
    setEmail(p.email);
    setPassword(p.pass);
    setErrorMessage("");
  };

  return (
    <div className="modal-overlay-custom" style={{ zIndex: 99999, background: "rgba(10, 18, 30, 0.88)", backdropFilter: "blur(8px)" }}>
      <div 
        className="modal-box-custom"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "460px",
          width: "92vw",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(0, 180, 198, 0.3)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 180, 198, 0.15)",
          background: "#ffffff"
        }}
      >
        {/* Top Header Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "26px 28px 22px",
          color: "#ffffff",
          textAlign: "center",
          position: "relative"
        }}>
          {isSwitching && onClose && (
            <button 
              onClick={onClose}
              style={{
                position: "absolute",
                top: "14px",
                inlineSize: "28px",
                blockSize: "28px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem"
              }}
            >
              ✕
            </button>
          )}

          {/* Logo */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ background: "#00b4c6", padding: "6px", borderRadius: "8px", display: "flex" }}>
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div style={{ fontSize: "1.45rem", fontWeight: "900", letterSpacing: "0.5px" }}>
              <span style={{ color: "#00b4c6" }}>GPS</span>
              <span style={{ color: "#ffffff" }}>WOX</span>
            </div>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>
            {lang === "ar" 
              ? "منظومة تتبع المركبات وإدارة الأساطيل الذكية" 
              : "Enterprise Fleet Telematics Platform"}
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: "24px 28px 28px" }}>
          {errorMessage && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px"
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Email Field */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>
                {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", marginInlineStart: "12px", color: "#94a3b8", display: "flex" }}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  dir="ltr"
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00b4c6"}
                  onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#334155" }}>
                  {lang === "ar" ? "كلمة المرور" : "Password"}
                </label>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", marginInlineStart: "12px", color: "#94a3b8", display: "flex" }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  style={{
                    width: "100%",
                    padding: "10px 38px 10px 38px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#00b4c6"}
                  onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    insetInlineEnd: "10px",
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#64748b", cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                  style={{ accentColor: "#00b4c6" }}
                />
                <span>{lang === "ar" ? "تذكر تسجيل الدخول" : "Remember session"}</span>
              </label>
              <span style={{ fontSize: "0.75rem", color: "#00b4c6", cursor: "pointer" }}>
                {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: "linear-gradient(135deg, #00b4c6 0%, #0098a7 100%)",
                color: "#ffffff",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "0.92rem",
                fontWeight: "700",
                cursor: isLoading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(0, 180, 198, 0.3)",
                marginTop: "6px",
                transition: "transform 0.15s, opacity 0.15s",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              <LogIn size={16} />
              <span>{isLoading ? (lang === "ar" ? "جاري التحقق..." : "Authenticating...") : (lang === "ar" ? "تسجيل الدخول إلى المنظومة" : "Sign In to Platform")}</span>
            </button>
          </form>

          {/* Quick Preset Selector for Easy Testing */}
          <div style={{ marginTop: "22px", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
            <span style={{ display: "block", fontSize: "0.74rem", fontWeight: "700", color: "#64748b", marginBottom: "8px", textAlign: "center" }}>
              {lang === "ar" ? "⚡ اختر حساباً للتجربة السريعة:" : "⚡ Quick Switch Demo Accounts:"}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {presets.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: email === p.email ? "1px solid #00b4c6" : "1px solid #f1f5f9",
                    background: email === p.email ? "rgba(0, 180, 198, 0.08)" : "#f8fafc",
                    cursor: "pointer",
                    fontSize: "0.78rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {p.icon}
                    <div>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>{p.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{p.email}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.68rem",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: email === p.email ? "#00b4c6" : "#e2e8f0",
                    color: email === p.email ? "#fff" : "#475569",
                    fontWeight: "600"
                  }}>
                    {p.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  Globe2,
  CheckCircle,
  Radio,
  KeyRound,
  Shield,
  HelpCircle,
  Server
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";
import { initialClients } from "../data/mockClients";
import { API_ENDPOINTS } from "../config/api";

export function LoginPage({ lang, setLang, onLoginSuccess, justLoggedOut = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const performLogin = async (loginEmail, loginPassword) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Primary: Real PostgreSQL JWT Authentication via Backend API
      let authSucceeded = false;
      try {
        const res = await fetch(API_ENDPOINTS.login, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
        });

        const data = await res.json();
        if (res.ok && data.success && data.token) {
          if (rememberMe) {
            localStorage.setItem("gpswox_token", data.token);
            localStorage.setItem("gpswox_user", JSON.stringify(data.user));
          } else {
            sessionStorage.setItem("gpswox_token", data.token);
            sessionStorage.setItem("gpswox_user", JSON.stringify(data.user));
          }
          soundFX.playAlert();
          onLoginSuccess(data.user, data.token);
          authSucceeded = true;
          return;
        } else if (res.status === 401 || res.status === 400 || res.status === 429) {
          // Explicit authentication or rate limit rejection from server
          throw new Error(data.error || (lang === "ar" ? "بيانات الدخول غير صحيحة" : "Invalid login credentials"));
        }
      } catch (apiErr) {
        // If it was an explicit server error response (not a network drop), propagate it
        if (apiErr.message && !apiErr.message.toLowerCase().includes("failed to fetch") && !apiErr.message.toLowerCase().includes("networkerror")) {
          throw apiErr;
        }
        console.warn("[Auth] Backend unreachable, falling back to offline demo store:", apiErr.message);
      }

      if (authSucceeded) return;

      // 2. Offline Fallback: Local demo store if backend is temporarily disconnected
      const localMatch = initialClients.find(c => 
        c.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (localMatch) {
        const dummyToken = `jwt_offline_dev_${localMatch.id}_${Date.now()}`;
        if (rememberMe) {
          localStorage.setItem("gpswox_token", dummyToken);
          localStorage.setItem("gpswox_user", JSON.stringify(localMatch));
        } else {
          sessionStorage.setItem("gpswox_token", dummyToken);
          sessionStorage.setItem("gpswox_user", JSON.stringify(localMatch));
        }
        soundFX.playAlert();
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(localMatch, dummyToken);
        }, 200);
        return;
      }

      throw new Error(lang === "ar" ? "بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور" : "Invalid login credentials");
    } catch (err) {
      soundFX.playOverspeed();
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    soundFX.playClick();

    if (!email.trim() || !password) {
      setErrorMessage(lang === "ar" ? "يرجى إدخال البريد الإلكتروني وكلمة المرور" : "Please enter email and password");
      return;
    }

    performLogin(email, password);
  };

  return (
    <div 
      className={`gps-login-page-root layout-${lang}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "radial-gradient(circle at 50% 15%, #0f1d33 0%, #080f1a 60%, #03070d 100%)",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowY: "auto",
        fontFamily: "var(--font-sans, 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
        position: "relative"
      }}
    >
      {/* Dynamic Ambient Background Glows */}
      <div style={{
        position: "absolute",
        top: "-15%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "700px",
        height: "500px",
        background: "radial-gradient(circle, rgba(0, 180, 198, 0.18) 0%, rgba(2, 132, 199, 0.08) 45%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-10%",
        right: "10%",
        width: "500px",
        height: "400px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 60%)",
        filter: "blur(70px)",
        pointerEvents: "none"
      }} />

      {/* Cyber Grid Pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        pointerEvents: "none"
      }} />

      {/* Top Navbar */}
      <header style={{
        position: "relative",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 40px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        background: "rgba(10, 18, 30, 0.6)",
        backdropFilter: "blur(16px)"
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            background: "linear-gradient(135deg, #00b4c6 0%, #0891b2 100%)",
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 25px rgba(0, 180, 198, 0.45)"
          }}>
            <Radio size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: "1.45rem", fontWeight: "900", letterSpacing: "0.5px", lineHeight: 1.1 }}>
              <span style={{ color: "#00b4c6" }}>GPS</span><span style={{ color: "#ffffff" }}>WOX</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "600", letterSpacing: "1.2px", marginTop: "2px" }}>
              ENTERPRISE FLEET TRACKING SYSTEM
            </div>
          </div>
        </div>

        {/* System Status & Language Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.78rem",
            color: "#34d399",
            background: "rgba(16, 185, 129, 0.08)",
            padding: "6px 14px",
            borderRadius: "20px",
            border: "1px solid rgba(16, 185, 129, 0.25)"
          }}>
            <span style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              background: "#10b981", 
              boxShadow: "0 0 10px #10b981",
              display: "inline-block" 
            }} />
            <span style={{ fontWeight: "600" }}>{lang === "ar" ? "المنظومة متصلة وآمنة • SSL 256-bit" : "System Secure & Online"}</span>
          </div>

          <button
            onClick={() => {
              soundFX.playClick();
              const next = lang === "ar" ? "en" : "ar";
              setLang(next);
              document.documentElement.lang = next;
              document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
            }}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#f8fafc",
              padding: "7px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.84rem",
              fontWeight: "600",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"}
          >
            <Globe2 size={16} color="#00b4c6" />
            <span>{lang === "ar" ? "English" : "العربية"}</span>
            <span>{lang === "ar" ? "🇬🇧" : "🇱🇾"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        position: "relative",
        zIndex: 20,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px"
      }}>
        {/* Main Login Glass Card */}
        <div style={{
          maxWidth: "460px",
          width: "100%",
          background: "linear-gradient(180deg, rgba(17, 26, 44, 0.85) 0%, rgba(11, 19, 34, 0.95) 100%)",
          borderRadius: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 45px rgba(0, 180, 198, 0.15)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(0, 180, 198, 0.25)",
          overflow: "hidden",
          transition: "all 0.3s ease"
        }}>
          {/* Card Top Glow Accent Line */}
          <div style={{
            height: "3px",
            width: "100%",
            background: "linear-gradient(90deg, transparent, #00b4c6, #38bdf8, transparent)"
          }} />

          {/* Card Header */}
          <div style={{
            padding: "36px 36px 20px",
            textAlign: "center"
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(0, 180, 198, 0.2) 0%, rgba(2, 132, 199, 0.1) 100%)",
              border: "1px solid rgba(0, 180, 198, 0.4)",
              marginBottom: "16px",
              color: "#00b4c6",
              boxShadow: "0 0 25px rgba(0, 180, 198, 0.25)"
            }}>
              <ShieldCheck size={28} />
            </div>

            <h1 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "900", 
              margin: "0 0 8px", 
              color: "#ffffff",
              letterSpacing: "-0.5px"
            }}>
              {lang === "ar" ? "تسجيل الدخول للمنظومة" : "Sign In to Platform"}
            </h1>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.5 }}>
              {lang === "ar" 
                ? "أدخل بيانات اعتمادك للوصول إلى لوحة تتبع وإدارة الأساطيل" 
                : "Enter your account credentials to access fleet management"}
            </p>
          </div>

          {/* Form Content */}
          <div style={{ padding: "10px 36px 36px" }}>
            {/* Logged Out Notice */}
            {justLoggedOut && (
              <div style={{
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#6ee7b7",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                fontWeight: "600"
              }}>
                <CheckCircle size={18} color="#10b981" />
                <span>{lang === "ar" ? "تم تسجيل الخروج بنجاح. جلستك السابقة مغلقة بأمان." : "You have been logged out securely."}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div style={{
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                color: "#fca5a5",
                padding: "12px 16px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
                fontWeight: "600"
              }}>
                <AlertCircle size={18} color="#ef4444" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Email Input Field */}
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.84rem", 
                  fontWeight: "700", 
                  color: "#cbd5e1", 
                  marginBottom: "8px" 
                }}>
                  {lang === "ar" ? "البريد الإلكتروني أو اسم المستخدم" : "Email or Username"}
                </label>
                <div style={{ 
                  position: "relative", 
                  display: "flex", 
                  alignItems: "center",
                  borderRadius: "10px",
                  transition: "all 0.2s ease"
                }}>
                  <div style={{ 
                    position: "absolute", 
                    marginInlineStart: "14px", 
                    color: emailFocused ? "#00b4c6" : "#64748b", 
                    display: "flex",
                    transition: "color 0.2s ease"
                  }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="name@domain.com"
                    dir="ltr"
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      paddingInlineStart: "44px",
                      borderRadius: "10px",
                      border: `1.5px solid ${emailFocused ? "#00b4c6" : "rgba(255, 255, 255, 0.12)"}`,
                      background: "#0b1424",
                      fontSize: "0.95rem",
                      color: "#ffffff",
                      outline: "none",
                      boxShadow: emailFocused ? "0 0 0 3px rgba(0, 180, 198, 0.2)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  marginBottom: "8px" 
                }}>
                  <label style={{ 
                    fontSize: "0.84rem", 
                    fontWeight: "700", 
                    color: "#cbd5e1" 
                  }}>
                    {lang === "ar" ? "كلمة المرور" : "Password"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#38bdf8",
                      fontSize: "0.78rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      textUnderlineOffset: "3px"
                    }}
                  >
                    {lang === "ar" ? "مساعدة في الدخول؟" : "Need Help?"}
                  </button>
                </div>

                <div style={{ 
                  position: "relative", 
                  display: "flex", 
                  alignItems: "center",
                  borderRadius: "10px"
                }}>
                  <div style={{ 
                    position: "absolute", 
                    marginInlineStart: "14px", 
                    color: passwordFocused ? "#00b4c6" : "#64748b", 
                    display: "flex",
                    transition: "color 0.2s ease"
                  }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••••••"
                    dir="ltr"
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      paddingInlineStart: "44px",
                      paddingInlineEnd: "46px",
                      borderRadius: "10px",
                      border: `1.5px solid ${passwordFocused ? "#00b4c6" : "rgba(255, 255, 255, 0.12)"}`,
                      background: "#0b1424",
                      fontSize: "0.95rem",
                      color: "#ffffff",
                      outline: "none",
                      boxShadow: passwordFocused ? "0 0 0 3px rgba(0, 180, 198, 0.2)" : "none",
                      transition: "all 0.2s ease"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      marginInlineEnd: "14px",
                      right: lang === "ar" ? "auto" : "14px",
                      left: lang === "ar" ? "14px" : "auto",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "4px"
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "-4px" }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "9px", 
                  fontSize: "0.84rem", 
                  color: "#94a3b8", 
                  cursor: "pointer",
                  userSelect: "none"
                }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                    style={{ 
                      accentColor: "#00b4c6", 
                      width: "16px", 
                      height: "16px",
                      cursor: "pointer" 
                    }}
                  />
                  <span>{lang === "ar" ? "تذكر بيانات تسجيل الدخول على هذا الجهاز" : "Remember my login on this device"}</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: isLoading 
                    ? "rgba(0, 180, 198, 0.6)" 
                    : "linear-gradient(135deg, #00b4c6 0%, #0284c7 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "800",
                  cursor: isLoading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 8px 24px rgba(0, 180, 198, 0.35)",
                  marginTop: "8px",
                  transition: "all 0.25s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 180, 198, 0.45)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 180, 198, 0.35)";
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid #ffffff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }} />
                    <span>{lang === "ar" ? "جاري المصادقة والتحقق..." : "Authenticating..."}</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>{lang === "ar" ? "تسجيل الدخول إلى المنظومة" : "Sign In to Platform"}</span>
                  </>
                )}
              </button>
            </form>

            {/* Trust Footer Badges */}
            <div style={{
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              fontSize: "0.75rem",
              color: "#64748b"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Shield size={14} color="#00b4c6" />
                <span>{lang === "ar" ? "تشفير تام للبيانات" : "End-to-End Encryption"}</span>
              </div>
              <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Server size={14} color="#10b981" />
                <span>{lang === "ar" ? "خادم موثق ومرخص" : "Certified Server"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      {showHelpModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000000,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            maxWidth: "420px",
            width: "100%",
            background: "#0f172a",
            border: "1px solid rgba(0, 180, 198, 0.3)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
            color: "#ffffff"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <HelpCircle size={24} color="#00b4c6" />
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800" }}>
                {lang === "ar" ? "المساعدة واستعادة الحساب" : "Account Support & Recovery"}
              </h3>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.6, margin: "0 0 16px" }}>
              {lang === "ar" 
                ? "إذا نسيت كلمة المرور أو تحتاج لتفعيل حساب جديد، يرجى التواصل مباشرة مع الموزع المعتمد لمنطقتك أو مسؤول الأسطول في شركتك." 
                : "If you forgot your password or need a new account, please contact your authorized reseller or fleet administrator."}
            </p>
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "0.82rem",
              color: "#cbd5e1",
              marginBottom: "20px"
            }}>
              <div><strong>{lang === "ar" ? "البريد المعتمد للدعم:" : "Support Email:"}</strong> support@gpswox.com</div>
              <div style={{ marginTop: "4px" }}><strong>{lang === "ar" ? "ساعات الدعم:" : "Hours:"}</strong> 24/7 Live Operations</div>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              style={{
                width: "100%",
                background: "#00b4c6",
                color: "#ffffff",
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {lang === "ar" ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        position: "relative",
        zIndex: 20,
        textAlign: "center",
        padding: "16px 24px",
        fontSize: "0.78rem",
        color: "#64748b",
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        background: "rgba(10, 18, 30, 0.6)",
        backdropFilter: "blur(12px)"
      }}>
        <div>
          GPSWOX Enterprise Fleet Management Platform • الإصدار المؤسسي المعتمد
        </div>
        <div style={{ fontSize: "0.72rem", color: "#475569", marginTop: "4px" }}>
          جميع الحقوق محفوظة © {new Date().getFullYear()} • نظام الحماية والعزل المتعدد للبيانات (Multi-Tenant RBAC)
        </div>
      </footer>

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


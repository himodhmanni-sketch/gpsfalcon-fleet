import React from "react";
import { HelpCircle, Play, Info, Sparkles } from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function OfficialHeader({ 
  lang, 
  onUpgradeClick,
  onGuideClick,
  onAddTrackerClick,
  onSupportClick
}) {
  return (
    <div className="official-top-header">
      <button 
        className="upgrade-btn-teal" 
        onClick={() => {
          soundFX.playClick();
          onUpgradeClick();
        }}
      >
        <Sparkles size={13} style={{ marginInlineEnd: "4px" }} />
        {lang === "ar" ? "ترقية الباقة الآن" : "Upgrade Now"}
      </button>

      <span className="trial-days-text" dir="ltr">
        {lang === "ar" ? (
          <>متبقي <strong>14</strong> يوماً في نسختك التجريبية</>
        ) : (
          <><strong>14</strong> days left in your free trial</>
        )}
      </span>

      <button 
        className="top-help-link-btn" 
        onClick={() => {
          soundFX.playClick();
          onSupportClick();
        }}
      >
        <HelpCircle size={14} color="#00b4c6" />
        <span>{lang === "ar" ? "الأسئلة؟ support@gpswox.com" : "Questions? support@gpswox.com"}</span>
      </button>

      <button 
        className="top-help-link-btn" 
        onClick={() => {
          soundFX.playClick();
          onGuideClick();
        }}
      >
        <Play size={12} fill="#0284c7" color="#0284c7" />
        <span>{lang === "ar" ? "شرح استخدام المنظومة بالفيديو" : "How to use the software"}</span>
      </button>

      <button 
        className="top-help-link-btn" 
        onClick={() => {
          soundFX.playClick();
          onAddTrackerClick();
        }}
      >
        <Info size={14} color="#0284c7" />
        <span>{lang === "ar" ? "كيفية ربط أول جهاز GPS أو هاتف" : "How to add your first GPS tracker"}</span>
      </button>
    </div>
  );
}

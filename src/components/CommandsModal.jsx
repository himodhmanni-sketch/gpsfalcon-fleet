import React, { useState } from "react";
import { 
  Terminal, 
  X, 
  PowerOff, 
  Lock, 
  Unlock, 
  Volume2, 
  Camera, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  Loader2,
  ShieldAlert
} from "lucide-react";
import { soundFX } from "../utils/audioAlert";

export function CommandsModal({
  lang,
  t,
  vehicle,
  onClose,
  onCommandSuccess,
  defaultCommand,
  currentUser
}) {
  const isDriver = currentUser?.role === "driver";
  const [selectedCmd, setSelectedCmd] = useState(defaultCommand || (isDriver ? "lock_doors" : "immobilize"));
  const [securityPin, setSecurityPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [commandLog, setCommandLog] = useState(() => [
    { time: "12:00:01", text: `Connected to GPRS Terminal on ${vehicle?.plateNumber || "---"}`, type: "info" }
  ]);

  // Early return AFTER hooks to avoid rules-of-hooks violation
  if (!vehicle) return null;

  const commandsList = [
    {
      id: "immobilize",
      title: vehicle.immobilized ? t.commands.resumeEngine : t.commands.immobilize,
      icon: <PowerOff size={18} />,
      type: "danger",
      needsPin: true,
      desc: vehicle.immobilized 
        ? (lang === "ar" ? "إعادة توصيل مضخة الوقود وتمكين السائق من إدارة المحرك" : "Restore fuel relay to allow ignition")
        : t.commands.immobilizeConfirm
    },
    {
      id: "lock_doors",
      title: t.commands.lockDoors,
      icon: <Lock size={18} />,
      type: "normal",
      needsPin: false,
      desc: lang === "ar" ? "قفل الأبواب المركزية للمركبة لاسلكياً" : "Lock all vehicle doors via central ECU"
    },
    {
      id: "unlock_doors",
      title: t.commands.unlockDoors,
      icon: <Unlock size={18} />,
      type: "normal",
      needsPin: false,
      desc: lang === "ar" ? "فتح الأبواب المركزية للسائق أو فرق الطوارئ" : "Unlock central doors"
    },
    {
      id: "horn",
      title: t.commands.horn,
      icon: <Volume2 size={18} />,
      type: "normal",
      needsPin: false,
      desc: lang === "ar" ? "تشغيل كلاكس/بوق الإنذار للمساعدة في تحديد موقع المركبة" : "Sound horn for 10 seconds"
    },
    {
      id: "buzzer",
      title: t.commands.setBuzzer,
      icon: <Bell size={18} />,
      type: "normal",
      needsPin: false,
      desc: lang === "ar" ? "تفعيل جرس تحذير السرعة داخل قمرة القيادة" : "Trigger speed alarm chime inside cabin"
    },
    {
      id: "photo",
      title: t.commands.requestPhoto,
      icon: <Camera size={18} />,
      type: "normal",
      needsPin: false,
      desc: lang === "ar" ? "طلب صورة فورية من كاميرا القياس الذكية الأمامية" : "Capture and upload dual dashcam photo"
    }
  ];

  const handleSendCommand = () => {
    soundFX.playClick();
    if (isDriver && activeCommandObj?.id === "immobilize") {
      soundFX.playOverspeed();
      alert(lang === "ar" ? "عفواً، صلاحية تعطيل المحرك مقتصرة على مدراء الأسطول فقط وغير مصرحة للسائق." : "Immobilize command is restricted to fleet managers.");
      return;
    }

    // PIN check for immobilize
    if (activeCommandObj?.needsPin) {
      if (securityPin !== "1234") {
        soundFX.playWarning();
        setPinError(lang === "ar" ? "رمز الأمان غير صحيح! الرمز الافتراضي للتجربة: 1234" : "Invalid PIN! Default demo PIN is: 1234");
        return;
      }
    }

    setPinError("");
    setIsSending(true);

    const timeStr = new Date().toLocaleTimeString();
    setCommandLog(prev => [
      ...prev,
      { time: timeStr, text: `> DISPATCH [${selectedCmd.toUpperCase()}] to IMEI:${vehicle.id} ...`, type: "sending" }
    ]);

    setTimeout(() => {
      setIsSending(false);
      soundFX.playAlert();

      setCommandLog(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), text: `< ACK 200: Command [${selectedCmd.toUpperCase()}] EXECUTED SUCCESSFULLY`, type: "success" }
      ]);

      if (onCommandSuccess) {
        onCommandSuccess(vehicle.id, selectedCmd);
      }
    }, 1200);
  };

  return (
    <div className="modal-backdrop-blur">
      <div className="commands-modal-box">
        {/* Modal Header */}
        <div className="modal-header-row">
          <div className="modal-header-title">
            <Terminal size={20} className="terminal-title-icon" />
            <div>
              <h3>{t.commands.title}</h3>
              <p className="modal-subtitle">
                {lang === "ar" ? vehicle.name : (vehicle.nameEn || vehicle.name)} - {vehicle.plateNumber}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-split">
          {/* Commands Selector List */}
          <div className="commands-selector-col">
            <div className="col-subheading">{lang === "ar" ? "اختر الأمر المراد إرساله" : "Select Command"}</div>
            <div className="commands-pills-list">
              {commandsList.map(cmd => (
                <button
                  key={cmd.id}
                  className={`command-select-pill ${cmd.type} ${selectedCmd === cmd.id ? "active" : ""}`}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedCmd(cmd.id);
                    setPinError("");
                  }}
                >
                  <span className="cmd-pill-icon">{cmd.icon}</span>
                  <span className="cmd-pill-title">{cmd.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Command Details & Execution Console */}
          <div className="command-execution-col">
            {(() => {
              const activeCmd = commandsList.find(c => c.id === selectedCmd);
              return (
                <div className="execution-card">
                  <div className="cmd-desc-box">
                    <div className="cmd-desc-title">{activeCmd?.title}</div>
                    <div className="cmd-desc-text">{activeCmd?.desc}</div>
                  </div>

                  {activeCmd?.needsPin && (
                    <div className="pin-input-section">
                      <label className="pin-label">
                        <ShieldAlert size={14} />
                        <span>{lang === "ar" ? "أدخل رمز الأمان لتأكيد الأمر" : "Security PIN Required"}</span>
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder={t.commands.pinPlaceholder}
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value)}
                        className={`pin-input-field ${pinError ? "error" : ""}`}
                      />
                      {pinError && <div className="pin-error-text">{pinError}</div>}
                    </div>
                  )}

                  {/* Terminal Log Console */}
                  <div className="terminal-live-console">
                    <div className="terminal-titlebar">GPRS TELEMATICS PROTOCOL STREAM</div>
                    <div className="terminal-lines">
                      {commandLog.map((log, idx) => (
                        <div key={idx} className={`terminal-line ${log.type}`}>
                          <span className="log-time">[{log.time}]</span> {log.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="cmd-actions-footer">
                    <button
                      className={`submit-cmd-btn ${activeCmd?.type === "danger" ? "danger" : "primary"}`}
                      onClick={handleSendCommand}
                      disabled={isSending}
                    >
                      {isSending ? (
                        <>
                          <Loader2 size={16} className="spinner" />
                          <span>{lang === "ar" ? "جاري الإرسال عبر البرج..." : "Dispatching via GSM..."}</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>{t.commands.send}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

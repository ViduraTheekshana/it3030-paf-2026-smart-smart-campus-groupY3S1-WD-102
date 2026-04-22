// src/components/OtpInput.jsx
import React, { useRef, useState } from "react";

export default function OtpInput({ length = 6, onChange, hasError }) {
    const [digits, setDigits] = useState(Array(length).fill(""));
    const refs = useRef([]);

    function handleChange(index, value) {
        // Allow only digits
        const char = value.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[index] = char;
        setDigits(next);
        onChange(next.join(""));
        if (char && index < length - 1) refs.current[index + 1]?.focus();
    }

    function handleKeyDown(index, e) {
        if (e.key === "Backspace") {
            if (digits[index]) {
                const next = [...digits];
                next[index] = "";
                setDigits(next);
                onChange(next.join(""));
            } else if (index > 0) {
                refs.current[index - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft"  && index > 0)          refs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
    }

    function handlePaste(e) {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        const next = Array(length).fill("");
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setDigits(next);
        onChange(next.join(""));
        const focusIdx = Math.min(pasted.length, length - 1);
        refs.current[focusIdx]?.focus();
    }

    return (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "8px 0" }}>
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={el => (refs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    autoFocus={i === 0}
                    style={{
                        width: 46,
                        height: 54,
                        textAlign: "center",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#0f172a",
                        border: `2px solid ${hasError ? "#f87171" : d ? "#3b82f6" : "#e2e8f0"}`,
                        borderRadius: 12,
                        background: hasError ? "#fff5f5" : d ? "#eff6ff" : "#f8fafc",
                        outline: "none",
                        transition: "all 0.15s ease",
                        fontFamily: "'DM Sans', sans-serif",
                        caretColor: "transparent",
                        boxShadow: d ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
                    }}
                />
            ))}
        </div>
    );
}

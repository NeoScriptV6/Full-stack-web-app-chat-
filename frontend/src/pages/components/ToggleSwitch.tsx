// ToggleSwitch.tsx
import React from "react";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
};

export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div className="form-check form-switch d-flex align-items-center">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id="toggleSwitch"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ cursor: "pointer" }}
      />
      {label && (
        <label className="form-check-label ms-2" htmlFor="toggleSwitch">
          {label}
        </label>
      )}
    </div>
  );
}
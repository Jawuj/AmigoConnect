import React, { useState, useRef, useEffect } from 'react';
import Icons from './Icons';

export default function CustomSelect({
    name,
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    required = false,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(value || "");
    const selectRef = useRef(null);

    // Permitir control externo
    useEffect(() => {
        if (value !== undefined) setInternalValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        setInternalValue(val);
        setIsOpen(false);
        if (onChange) {
            onChange({ target: { name, value: val } });
        }
    };

    const selectedOption = options.find(o =>
        (typeof o === 'object' ? o.value : o) === internalValue
    );

    const displayLabel = selectedOption
        ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
        : placeholder;

    return (
        <div className={`custom-select-container ${className}`} ref={selectRef}>
            {name && <input type="hidden" name={name} value={internalValue} required={required} />}

            <div
                className={`custom-select-header ${isOpen ? 'open' : ''} ${!internalValue && !selectedOption ? 'placeholder' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{displayLabel}</span>
                <span className={`custom-select-arrow ${isOpen ? 'open' : ''}`}>
                    <Icons.ChevronDown />
                </span>
            </div>

            {isOpen && (
                <div className="custom-select-dropdown">
                    {options.map((opt, i) => {
                        const optVal = typeof opt === 'object' ? opt.value : opt;
                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                        const isSelected = optVal === internalValue;

                        return (
                            <div
                                key={i}
                                className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelect(optVal)}
                            >
                                {optLabel}
                                {isSelected && <span className="custom-select-check">✓</span>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

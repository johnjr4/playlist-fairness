import React, { useState, useRef, useEffect } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';

type DropdownProps = {
    onLogout?: () => void;
    children: React.ReactNode;
    hasCaret?: boolean;
    color?: string,
    hoverColor?: string,
    items: DropdownItem[];
};

export type DropdownItem = {
    label: string;
    onClick: () => void;
};

function Dropdown({ children, items, hasCaret = true, color = 'bg-secondary', hoverColor = 'bg-secondary-light' }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Will simply maintain a reference to the 
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Close dropdown on click outside
    // This logic is inside useEffect because it is coordinating with an external service: a DOM API
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // If we have a reference to the dropdown and the event passed to this function is NOT a descendant of that ref...
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Then we clicked somewhere else and should close it
                setIsOpen(false);
            }
        };

        // Add this event listener on render
        document.addEventListener('mousedown', handleClickOutside);
        // Clean it up on dismount/re-render
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Event handler
    function handleItemClick(onClick: () => void) {
        setIsOpen(false);
        onClick();
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Main button component */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center px-3 py-1 gap-1.5 ${color} rounded-sm hover:${hoverColor}`}
            >
                {children}
                {hasCaret && <AiFillCaretDown size='12' color='var(--text-primary)' />}
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className={`absolute right-0 mt-1.5 w-40 ${color} rounded-sm shadow-lg z-50`}>
                    {items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleItemClick(item.onClick)}
                            className={`block w-full text-left px-4 py-2 rounded-sm text-sm hover:${hoverColor}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;

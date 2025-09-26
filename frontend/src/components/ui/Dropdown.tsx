import React, { useState, useRef, useEffect } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import hoverClasses from '../../styling/hovereffect.module.css'
import useClickOutside from '../../utils/useClickOutside';

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

function Dropdown({ children, items, hasCaret = true, color = 'bg-secondary' }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    // Will simply maintain a reference to the 
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Close dropdown when clicking outside
    useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

    // Event handler
    function handleItemClick(onClick: () => void) {
        setIsOpen(false);
        onClick();
    };

    return (
        <div className="relative inline-block text-left bg-inherit cursor-pointer" ref={dropdownRef}>
            {/* Main button component */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center px-3 py-1 gap-1.5 ${color} rounded-sm ${hoverClasses.hover3D} ${hoverClasses.transition} cursor-pointer`}
            >
                {children}
                {hasCaret && <AiFillCaretDown size='12' color='var(--text-primary)' />}
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className={`absolute right-0 mt-1.5 w-40 ${color} rounded-sm outline-2 outline-background-500 shadow-lg z-50 `}>
                    {items.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleItemClick(item.onClick)}
                            className={`block w-full text-left px-4 py-2 rounded-sm text-sm ${hoverClasses.hover3D} ${hoverClasses.transition} cursor-pointer`}
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

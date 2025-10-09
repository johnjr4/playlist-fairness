import React, { useState, useRef } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import hoverClasses from '../../styling/hovereffect.module.css'
import useClickOutside from '../../utils/useClickOutside';
import Button from './Button';

type DropdownProps = {
    onLogout?: () => void;
    children: React.ReactNode;
    hasCaret?: boolean;
    color?: string,
    hoverColor?: string,
    items: DropdownItem[];
    className?: string;
    positionClassName?: string;
    disabled?: boolean;
};

export type DropdownItem = {
    label: string;
    onClick: () => void;
    className?: string;
};

function Dropdown({ children, items, hasCaret = true, color = 'bg-background-700', className, positionClassName, disabled = false }: DropdownProps) {
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
        <div className={`${positionClassName} bg-inherit`}>
            <div className="relative inline-block text-left bg-inherit cursor-pointer" ref={dropdownRef}>
                {/* Main button component */}
                <Button
                    variant='secondary'
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`flex items-center ${className} gap-1.5 ${color} rounded-sm ${disabled && 'pointer-events-none opacity-40'} ${hoverClasses.hover3D} ${hoverClasses.transition} cursor-pointer`}
                    disabled={disabled}
                >
                    {children}
                    {hasCaret && <AiFillCaretDown size='12' color='var(--textPrimary)' />}
                </Button>

                {/* Dropdown menu */}
                {isOpen && (
                    <div className={`absolute right-0 mt-1.5 w-30 md:w-40 ${color} rounded-sm outline-2 outline-background-500 shadow-lg z-50 md:text-base`}>
                        {items.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleItemClick(item.onClick)}
                                className={`${item.className} block w-full text-left px-4 py-2 rounded-sm text-xs md:text-sm ${hoverClasses.hover3D} ${hoverClasses.transition} cursor-pointer`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dropdown;

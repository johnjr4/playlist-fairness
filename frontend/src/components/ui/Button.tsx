import hoverClasses from '../../styling/hovereffect.module.css'

type ButtonProps = {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    useDefaultSizing?: boolean;
}

function Button({ children, variant = 'primary', onClick, className, disabled = false, useDefaultSizing = false }: ButtonProps) {

    const variantStyles = {
        primary: `bg-primary-500 ${hoverClasses.hover3DPrimary}`,
        secondary: `${!className && 'bg-transparent'} ${hoverClasses.hover3D}`,
        danger: `bg-red-700 ${hoverClasses.hover3DDanger}`,
    };


    return (
        <button
            onClick={onClick}
            className={`text-textPrimary rounded-md font-medium cursor-pointer ${useDefaultSizing && 'px-2 py-1 lg:px-3 lg:py-2 text-sm lg:text-base'} ${disabled && 'pointer-events-none'} ${hoverClasses.transition} ${variantStyles[variant]} ${className}`}
            style={{ lineHeight: 'normal' }}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

export default Button;


import hoverClasses from '../../styling/hovereffect.module.css'

type ButtonProps = {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

function Button({ children, variant = 'primary', onClick, className, disabled = false }: ButtonProps) {

    const variantStyles = {
        primary: `bg-radial-[at_30%_40%] from-primary-500 from-30% to-primary-700 to-110% ${hoverClasses.hover3DPrimary}`,
        secondary: `bg-transparent ${hoverClasses.hover3D}`,
        danger: `bg-radial-[at_30%_40%] from-red-700 from-30% to-red-950 to-110%  ${hoverClasses.hover3DDanger}`,
    };


    return (
        <button
            onClick={onClick}
            className={`text-textPrimary  px-2 py-1 lg:px-4 lg:py-1.5 rounded-md font-medium cursor-pointer ${hoverClasses.transition} ${variantStyles[variant]} ${className}`}
            style={{ lineHeight: 'normal' }}
            disabled={disabled}
        >
            {children}
        </button>
    )
}

export default Button;


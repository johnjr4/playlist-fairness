import hoverClasses from '../../styling/hovereffect.module.css'

type ButtonProps = {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
    className?: string;
}

function Button({ children, variant = 'primary', onClick, className }: ButtonProps) {

    const variantStyles = {
        primary: `bg-primary border-primary text-textSecondary ${hoverClasses.hover3DPrimary}`,
        secondary: `bg-transparent border-transparent text-textPrimary ${hoverClasses.hover3D}`,
        danger: `bg-red-900 border-red-900 text-white ${hoverClasses.hover3DDanger}`,
    };


    return (
        <button
            onClick={onClick}
            className={`text-xs md:text-sm lg:text-base px-2 py-1 lg:px-4 lg:py-1.5 rounded-md font-medium cursor-pointer ${hoverClasses.transition} ${variantStyles[variant]} ${className}`}
        >
            {children}
        </button>
    )
}

export default Button;


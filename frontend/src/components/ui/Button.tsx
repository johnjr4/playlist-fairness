type ButtonProps = {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'secondaryInvert' | 'danger';
    onClick?: () => void;
    className?: string;
}

function Button({ children, variant = 'primary', onClick, className }: ButtonProps) {

    const variantStyles = {
        primary: 'bg-primary border-primary text-textSecondary hover:brightness-115',
        secondary: `bg-transparent border-textPrimary text-textPrimary hover:brightness-105`,
        secondaryInvert: `bg-transparent border-textSecondary text-textSecondary hover:brightness-105`,
        danger: 'bg-red-800 border-red-800 text-white hover:brightness-110',
    };


    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-md font-medium box-border border-2 ${variantStyles[variant]} ${className}`}
        >
            <div className="brightness-100">
                {children}
            </div>
        </button>
    )
}

export default Button;


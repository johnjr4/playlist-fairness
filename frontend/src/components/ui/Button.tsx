type ButtonProps = {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
    className?: string;
}

function Button({ children, variant = 'primary', onClick, className }: ButtonProps) {
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded font-medium focus:outline-none ${variantStyles[variant]} ${className}`}
        >
            {children}
        </button>
    )
}

export default Button;


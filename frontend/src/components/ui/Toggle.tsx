import cardClasses from '../../styling/cards.module.css'

interface ToggleProps {
    isOn: boolean;
    onToggle: (newVal: boolean) => void;
    onLabel?: string;
    offLabel?: string;
    className?: string;
    disabled?: boolean;
}

function getStatusClassName(isOn: boolean, isOnButton: boolean) {
    return isOn === isOnButton ? `bg-background-400 ${cardClasses['card-3D']} pointer-events-none` : 'bg-background-400 text-dark-highlight hover:brightness-120 cursor-pointer'
}

function Toggle({
    isOn,
    onToggle,
    onLabel = 'ON',
    offLabel = 'OFF',
    className,
    disabled = false,
}: ToggleProps) {
    return (
        <div className={`flex ${className} ${disabled && 'opacity-40'}`}>
            <button onClick={() => onToggle(true)} className={`py-0.5 px-1 rounded-l-sm ${getStatusClassName(isOn, true)}`}>
                {onLabel}
            </button>
            <button onClick={() => onToggle(false)} className={`py-0.5 px-1 rounded-r-sm ${getStatusClassName(isOn, false)}`}>
                {offLabel}
            </button>
        </div>
    );
}

export default Toggle;
import { useState } from "react";
import Button from "./ui/Button";

interface SearchBarProps {
    setSearchString: (searchString: string) => void;
    disabled?: boolean;
    className?: string;
    clearClassName?: string;
}

function SearchBar({ setSearchString, disabled = false, className, clearClassName }: SearchBarProps) {
    const [localQuery, setLocalQuery] = useState('');

    function setQuery(newQuery: string) {
        setLocalQuery(newQuery);
        setSearchString(newQuery);
    }

    return (
        // <div className='px-4 py-2 m-4 bg-red-300 lg:w-2xl'>Search bar goes here!</div>
        <div className={`flex justify-center items-center gap-2 md:gap-4 ${className} ${disabled ? 'opacity-40' : 'opacity-100'}`}>
            <input
                type='text'
                disabled={disabled}
                value={localQuery}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="relative z-10 px-2 py-1 lg:px-5 lg:py-3 w-full max-h-full rounded-sm bg-background-300 shadow-sm shadow-background-700 text-xs md:text-sm lg:text-base"
            />
            <Button
                onClick={!disabled ? () => setQuery('') : () => { }}
                variant="secondary"
                className={`max-h-full ${clearClassName} text-xs md:text-sm lg:text-base px-2 py-1 lg:px-3 lg:py-2`}
                disabled={disabled}
            >
                Clear
            </Button>
        </div>
    )
}

export default SearchBar;
import { useState } from "react";
import Button from "./ui/Button";

interface SearchBarProps {
    setSearchString: (searchString: string) => void;
    disabled?: boolean;
}

function SearchBar({ setSearchString, disabled = false }: SearchBarProps) {
    const [localQuery, setLocalQuery] = useState('');

    function setQuery(newQuery: string) {
        setLocalQuery(newQuery);
        setSearchString(newQuery);
    }

    return (
        // <div className='px-4 py-2 m-4 bg-red-300 lg:w-2xl'>Search bar goes here!</div>
        <div className="flex justify-center items-center gap-2 md:gap-4 my-4 sm:w-lg md:w-xl h-8 md:h-12">
            <input
                type='text'
                disabled={disabled}
                value={localQuery}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="relative z-10 px-5 py-3 w-full max-h-full rounded-sm bg-background-300 shadow-sm shadow-background-700"
            />
            <Button onClick={() => setQuery('')} variant="secondary" className="max-h-full" disabled={disabled}>
                Clear
            </Button>
        </div>
    )
}

export default SearchBar;
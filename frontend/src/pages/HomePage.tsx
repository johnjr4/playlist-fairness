import { useState } from 'react';
import PlaylistCardGrid from '../components/PlaylistCardGrid';
import SearchBar from '../components/SearchBar';

function HomePage() {
    const [filterString, setFilterString] = useState('');
    console.log("Rendering home page");

    return (
        <div className='flex flex-col content-center items-center w-full px-4'>
            <h1 className="mt-3 md:mt-5 xl:mt-8 text-2xl md:text-3xl xl:text-5xl font-bold [text-shadow:_0px_0px_20px_var(--color-background-300)] ">Your playlists</h1>
            <SearchBar setSearchString={setFilterString} />
            <PlaylistCardGrid filterString={filterString} />
        </div>
    )
}

export default HomePage;
import { useState } from 'react';
import PlaylistCardGrid from '../components/PlaylistCardGrid';
import SearchBar from '../components/SearchBar';
import gradientClasses from '../styling/gradient.module.css'

function HomePage() {
    const [filterString, setFilterString] = useState('');
    console.log("Rendering home page");

    // [text-shadow:_0px_0px_20px_var(--color-background-300)]
    return (

        <div className='flex flex-col justify-center items-center'
            style={{ paddingLeft: 'calc(100vw - 100%)' }} // Fixes layout shift when scrollbar appears
        >
            <div className={`flex flex-col items-center ${gradientClasses.dropShadow}`}>
                <h1 className={`mt-3 md:mt-5 xl:mt-8 text-2xl md:text-3xl xl:text-5xl font-bold`}>Your playlists</h1>
                <SearchBar setSearchString={setFilterString} className='my-4 sm:w-lg md:w-xl h-8 md:h-12' />
            </div>
            <PlaylistCardGrid filterString={filterString} />
        </div>
    )
}

export default HomePage;
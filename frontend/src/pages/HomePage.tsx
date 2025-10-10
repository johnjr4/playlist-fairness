import { useState } from 'react';
import PlaylistCardGrid from '../components/PlaylistCardGrid';
import SearchBar from '../components/SearchBar';
import cardGridClasses from '../styling/cardGrid.module.css';
import { useDebounce } from 'use-debounce';

function HomePage() {
    const [filterString, setFilterString] = useState('');
    const [debouncedFilterString] = useDebounce(filterString, 100);

    // [text-shadow:_0px_0px_20px_var(--color-background-300)]
    return (

        <div className='w-full flex flex-col justify-center items-center gap-2 lg:gap-5 pb-10'
            style={{ paddingLeft: 'calc(100vw - 100%)' }} // Fixes layout shift when scrollbar appears
        >
            <div
                className={`flex items-center gap-5 justify-between w-full mt-3 md:mt-5 xl:mt-8 max-w-[1610px] ${cardGridClasses['card-grid']}`}
            // style={{ backdropFilter: 'brightness(70%)' }}
            >
                <div
                    className='col-start-1 -col-end-3'
                    style={{ lineHeight: 'normal' }}
                >
                    <h1
                        className={`text-base sm:text-lg md:text-3xl xl:text-5xl font-bold text-nowrap`}
                    // style={{ backdropFilter: 'brightness(70%)' }}
                    >Your playlists</h1>
                </div>
                <div className='-col-start-3 -col-end-1 flex justify-end'>
                    <SearchBar setSearchString={setFilterString} className='w-full max-w-40 sm:max-w-60 md:max-w-80 lg:max-w-120 h-8 md:h-10' clearClassName='hidden sm:block' />
                </div>
            </div>
            <PlaylistCardGrid filterString={debouncedFilterString} />
        </div>
    )
}

export default HomePage;
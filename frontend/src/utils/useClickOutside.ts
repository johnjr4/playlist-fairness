import { useEffect, type RefObject } from 'react';

type Callback = (event: MouseEvent) => void;

/**
 * Hook that triggers a callback when clicking outside a referenced element.
 * @param ref - The element to detect outside clicks on
 * @param callback - Function to call on outside click
 * @param active - Whether the listener is active (default: true)
 */
const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    callback: Callback,
    active: boolean = true
): void => {
    // This logic is inside useEffect because it is coordinating with an external service: a DOM API
    useEffect(() => {
        // If the object is not active, don't do anything anyway
        if (!active) return;

        const handleClick = (event: MouseEvent) => {
            // If the ref to the HTMLElement exists and the event target is either it or one of its children...
            if (ref.current && !ref.current.contains(event.target as Node)) {
                // Call whatever callback the user provided for an outside click
                callback(event);
            }
        };

        // Add this event listener to the whole document
        document.addEventListener('mousedown', handleClick);

        // Clean it up on re-render/dismount
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [ref, callback, active]);
};

export default useClickOutside;
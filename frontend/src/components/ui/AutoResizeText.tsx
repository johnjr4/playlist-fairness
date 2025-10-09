import { useEffect, useRef } from "react";

interface AutoResizeTextProps {
    text: React.ReactNode;
    parentRef?: React.RefObject<HTMLDivElement | null>;
    maxFontSize: number; // in px
    minFontSize: number; // in px
    textStyle?: string;
    containerStyle?: string;
}

function AutoResizeText({ text, parentRef, maxFontSize, minFontSize, textStyle, containerStyle }: AutoResizeTextProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    // const [fontSize, setFontSize] = useState(maxFontSize);

    // Helper function to resize text
    function resizeText() {
        const container = parentRef ? parentRef.current : containerRef.current;
        const textEl = textRef.current

        // If the HTML elements don't exist then return
        if (!container || !textEl) return

        // Start by assuming full size, no wrap
        let newFontSize = maxFontSize
        textEl.style.whiteSpace = 'nowrap'
        // setAllowWrap(false)

        // While above min size, adjust down
        while (newFontSize >= minFontSize) {
            textEl.style.fontSize = `${newFontSize}px`

            // Check if text fits
            if (textEl.scrollWidth <= container.clientWidth) {
                break
            }
            newFontSize -= 1
        }

        // setFontSize(newFontSize)

        // If still overflowing at minFontSize, allow wrapping
        if (newFontSize <= minFontSize && textEl.scrollWidth > container.clientWidth) {
            textEl.style.whiteSpace = 'normal';
            // setAllowWrap(true)
        }
    }

    useEffect(() => {
        resizeText();

        // Create ResizeObservor with action that triggers our resizeText method
        const resizeObservor = new ResizeObserver(() => resizeText());
        if (parentRef && parentRef.current) {
            // Add our container to the list of elements it's observing
            resizeObservor.observe(parentRef.current);
        } else if (containerRef.current) {
            resizeObservor.observe(containerRef.current);
        }

        // Disconnect observor on dismount or before re-render
        return () => resizeObservor.disconnect();
    }, [text, minFontSize, maxFontSize]); // TODO: Add [text] depenency array?

    return (
        <div
            className={`w-full overflow-clip ${containerStyle}`}
            ref={containerRef}
        >
            <div
                ref={textRef}
                className={`${textStyle}`}
            >
                {text}
            </div>
        </div>
    )
}

export default AutoResizeText;
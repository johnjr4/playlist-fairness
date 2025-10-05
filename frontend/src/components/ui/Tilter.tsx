import { useEffect, useRef, useState } from "react";
// import DebugRect from "./debug/DebugRect";

interface TilterProps {
    children: React.ReactNode;
    maxAngle?: number;
    className?: string;
}

function Tilter({ children, maxAngle = 10, className }: TilterProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // const [rect, setRect] = useState<DOMRect | null>(null);
    const hoverDelay = 30; // ms
    const hoverFadeOut = 200; // ms
    const [transitionTime, setTransitionTime] = useState(hoverDelay);
    // const hoverPadding = 2; // px

    const [enterTimeoutId, setEnterTimeoutId] = useState(-1);
    const [leaveTimeoutId, setLeaveTimeoutId] = useState(-1);

    useEffect(() => {
        if (containerRef.current) {
            // const measuredRect = containerRef.current.getBoundingClientRect();
            // setRect(measuredRect);
        }
    }, []);

    // function isInside(clientX: number, clientY: number, rect: DOMRect) {
    //     return clientX >= rect.left + hoverPadding &&
    //         clientX <= rect.right - hoverPadding &&
    //         clientY >= rect.top + hoverPadding &&
    //         clientY <= rect.bottom - hoverPadding;
    // }

    function calcTilt(clientX: number, clientY: number, rect: DOMRect) {
        const x = clientX - rect.left; // mouse X inside element
        const y = clientY - rect.top;  // mouse Y inside element

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * maxAngle;
        const rotateY = ((x - centerX) / centerX) * -maxAngle;

        return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
        const container = containerRef.current;
        if (!container) return;

        // Transition into hover
        clearTimeout(leaveTimeoutId);
        setTransitionTime(hoverDelay);
        const updatedRect = container.getBoundingClientRect();
        container.style.transform = calcTilt(e.clientX, e.clientY, updatedRect)

        const newId = setTimeout(() => {
            setTransitionTime(0);
        }, hoverDelay);
        setEnterTimeoutId(newId);
    }

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const container = containerRef.current;
        if (!container) return;

        const updatedRect = container.getBoundingClientRect();

        if (transitionTime === 0) {
            container.style.transform = calcTilt(e.clientX, e.clientY, updatedRect);
            clearTimeout(enterTimeoutId);
        }
    }

    function handleMouseLeave() {
        const container = containerRef.current;
        if (!container) return;
        // container.style.transition = 'all 300ms ease-out'
        setTransitionTime(hoverFadeOut);
        container.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

        const newId = setTimeout(() => {
            setTransitionTime(hoverDelay);
        }, hoverFadeOut);
        setLeaveTimeoutId(newId);
    }

    return (
        <div className={className} onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} >
            <div ref={containerRef} style={{ transition: `transform ${transitionTime}ms ease-in-out` }}>
                {children}
            </div>
            {/* <DebugRect rect={rect} /> */}
        </div>
    )
}

export default Tilter;
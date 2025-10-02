import ModalPortal from "../ModalPortal";

interface DebugRectProps {
    rect: DOMRect | null;
}

function DebugRect({ rect }: DebugRectProps) {
    return (
        rect && <ModalPortal>
            <div
                style={{
                    position: 'absolute',
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                    border: '2px dashed red',
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}
            />
        </ModalPortal>
    );
};

export default DebugRect;

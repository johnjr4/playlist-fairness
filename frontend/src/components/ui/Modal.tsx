// src/components/Modal.tsx
import { useEffect, useRef } from 'react';
import useClickOutside from '../../utils/useClickOutside';
import ModalPortal from './ModalPortal';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    secondaryMessage?: string
}

function Modal({
    isOpen,
    onClose,
    onConfirm,
    message,
    secondaryMessage,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useClickOutside(modalRef, onClose, isOpen);

    useEffect(() => {
        if (isOpen) {
            // Save original overflow
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            // Cleanup on unmount or close
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <ModalPortal>
            {/* Background tint */}
            <div className="fixed inset-0 z-50 bg-background-700/50 flex items-center justify-center">
                {/* actual modal */}
                <div
                    ref={modalRef}
                    className="
                    flex flex-col items-center
                    gap-2 lg:gap-4
                    bg-background-400
                    text-textPrimary text-sm lg:text-base
                    rounded-md
                    shadow-xl shadow-background-700
                    p-4 lg:p-6 max-w-xs sm:max-w-sm lg:max-w-xl"
                >
                    <h2 className='font-bold text-center text-base lg:text-xl'>Warning</h2>
                    <div className='w-[90%] flex flex-col gap-2 text-center my-2'>
                        <p>{message}</p>
                        {secondaryMessage && <p className='text-sm text-background-50'>{secondaryMessage}</p>}
                    </div>
                    <div className="self-end flex justify-end gap-2">
                        <Button
                            onClick={onClose}
                            variant='secondary'
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            variant='danger'
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        </ModalPortal >
    );
};

export default Modal;

import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
    children: ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) console.error("modal-root element must exist for ModalPortal to work");
    return modalRoot ? createPortal(children, modalRoot) : null;
};

export default ModalPortal;
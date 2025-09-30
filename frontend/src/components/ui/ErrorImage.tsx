import { AiFillWarning } from "react-icons/ai";

interface ErrorImageProps {
    iconSize: string,
    message?: string,
    className?: string,
}

function ErrorImage({ iconSize, message, className }: ErrorImageProps) {
    return (
        <div className={`flex flex-col justify-center items-center ${className}`}>
            <AiFillWarning className={iconSize} />
            {message && <p>{message}</p>}
        </div>
    )
}

export default ErrorImage;
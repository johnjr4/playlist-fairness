import { useNavigate, useRouteError } from "react-router";
import Button from "../components/ui/Button";
import gradientClasses from '../styling/gradient.module.css';

function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();
    console.error('Page failed', error);
    return (
        <div className={`w-full h-full flex flex-col justify-center items-center gap-2 text-center text-textPrimary ${gradientClasses['bgGradient']}`}>
            <h1>Sorry, something went wrong</h1>
            <Button useDefaultSizing={true} onClick={() => navigate('/u')} >Back to Home</Button>
        </div>
    );
}

export default ErrorPage;
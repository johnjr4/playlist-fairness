import { useNavigate } from "react-router";
import Button from "../components/ui/Button";
import { useAuth } from "../utils/AuthContext";
import gradientClasses from '../styling/gradient.module.css';
import { handleLogin } from "../utils/handleLogin";

function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    function onClick() {
        if (user) {
            navigate('/u/playlists');
        } else {
            handleLogin();
        }
    }

    return (
        <div className={`flex flex-col justify-center items-center h-full text-textPrimary ${gradientClasses.bgGradient}`}>
            <h1 className="font-bold text-7xl p-6">Spotifair</h1>
            <Button onClick={onClick} variant='primary' className="px-3 py-2.5 xl:text-lg xl:px-4 xl:py-3">
                Get Started
            </Button>
        </div>
    )
}

export default LandingPage;
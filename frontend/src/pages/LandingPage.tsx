import { useNavigate } from "react-router";
import Button from "../components/ui/Button";
import { useAuth } from "../utils/AuthContext";

function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    function onClick() {
        if (user) {
            navigate('/u');
        } else {
            navigate('/auth/login');
        }
    }

    return (
        <div className="flex flex-col justify-center items-center h-full">
            <h1 className="font-bold text-7xl p-6">Spotifair</h1>
            <Button onClick={onClick}>
                Get Started
            </Button>
        </div>
    )
}

export default LandingPage;
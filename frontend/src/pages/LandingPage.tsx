import { useNavigate } from "react-router";
import Button from "../components/ui/Button";
import { useAuth } from "../utils/AuthContext";
import gradientClasses from '../styling/gradient.module.css';
import { handleLogin } from "../utils/handleLogin";
import cardClasses from '../styling/cards.module.css';

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
        <div className={`flex flex-col justify-center items-center h-full text-textPrimary gap-6 md:gap-10 ${gradientClasses.bgGradient}`}>
            <h1 className="font-bold text-6xl sm:text-7xl md:text-8xl">Spotifair</h1>
            <div
                className="flex flex-col lg:flex-row gap-4 lg:gap-5 text-sm md:text-base text-left"
                style={{ lineHeight: 'normal' }}
            >
                <LandingStep stepNum={1}>
                    <p>Log in and sync your profile</p>
                </LandingStep>
                <LandingStep stepNum={2}>
                    <p>Enable sync on a playlist</p>
                </LandingStep>
                <LandingStep stepNum={3}>
                    <p>Listen to that playlist on Spotify</p>
                </LandingStep>
                <LandingStep stepNum={4}>
                    <p>Analyze how fair your shuffle really is!</p>
                </LandingStep>
            </div>
            <Button onClick={onClick} variant='primary' className="px-3 py-2.5 xl:text-lg xl:px-4 xl:py-3">
                Get Started
            </Button>
        </div>
    )
}

function LandingStep({ stepNum, children }: { stepNum: number, children: React.ReactNode }) {
    return (
        <div className={`flex gap-2 justify-start items-center w-70 md:w-90 lg:w-60 text-left px-4 py-1 lg:py-3 rounded-xs ${cardClasses['glass-card']}`}>
            <p className="text-2xl font-bold w-5 shrink-0">{stepNum}</p>
            {children}
        </div>
    );
}

export default LandingPage;
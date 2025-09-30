import Button from "./ui/Button";
import { useAuth } from "../utils/AuthContext";
import { handleLogin } from "../utils/handleLogin";

function LoginButton({ className }: { className?: string }) {
    const { user } = useAuth();
    let isLoggedIn = false;
    if (user) {
        isLoggedIn = true;
    }

    return (
        <Button onClick={isLoggedIn ? undefined : handleLogin} variant={isLoggedIn ? 'secondary' : 'primary'} className={className}>
            {isLoggedIn ? 'Logged In' : 'Log In'}
        </Button>
    )
}

export default LoginButton;
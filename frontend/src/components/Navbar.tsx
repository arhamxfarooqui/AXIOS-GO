import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                    Axios
                </Link>
                <div className="space-x-4 flex items-center">
                    <Link to="/leaderboard" className="text-gray-300 hover:text-white transition-colors">Leaderboard</Link>
                    <Link to="/resources" className="text-gray-300 hover:text-white transition-colors">Resources</Link>
                    <Link to="/ai-lab" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold">AI Lab</Link>

                    {user ? (
                        <>
                            <Link to="/dashboard"><Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">Dashboard</Button></Link>
                            <Button variant="default" className="bg-red-600/80 hover:bg-red-700" onClick={handleLogout}>Logout</Button>
                        </>
                    ) : (
                        <Link to="/login"><Button variant="default" className="bg-purple-600 hover:bg-purple-700">Login</Button></Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

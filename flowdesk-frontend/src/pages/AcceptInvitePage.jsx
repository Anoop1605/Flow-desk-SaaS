import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, ArrowRight, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function AcceptInvitePage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid invitation link");
            navigate('/login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await api.post('/api/auth/accept-invite', {
                token,
                name: formData.name,
                password: formData.password
            });

            // Automatically log in the user with the returned token
            const { token: jwtToken, ...user } = data;
            setAuth(jwtToken, user);
            
            toast.success("Welcome aboard!");
            navigate('/', { replace: true });
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || err.message || "Failed to accept invite";
            toast.error(typeof msg === 'string' ? msg : "Error joining the team");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden p-4">
            <div className="absolute inset-0 w-full h-full overflow-hidden opacity-50 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-rose-500/10 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <div className="w-full max-w-sm relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-4 shadow-xl backdrop-blur-sm">
                        <Target className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                        Accept Invitation
                    </h1>
                    <p className="text-sm text-slate-400 text-center">
                        Set up your account details to join the workspace.
                    </p>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/[0.08] rounded-xl text-white text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/[0.08] rounded-xl text-white text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none"
                                    placeholder="Secure password (min 6 chars)"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1.5 block">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/[0.08] rounded-xl text-white text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all outline-none"
                                    placeholder="Type password again"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-white text-black hover:bg-slate-100 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center group disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="animate-spin text-black" />
                            ) : (
                                <>
                                    Join Workspace
                                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

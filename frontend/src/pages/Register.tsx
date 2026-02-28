import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        college_id: '',
        codeforces_handle: '',
        github_handle: ''
    });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [selectedWings, setSelectedWings] = useState<string[]>(["Competitive Programming"]); // Initialized with CP
    const [loading, setLoading] = useState(false); // Added
    const [error, setError] = useState(''); // Added

    const WINGS = [
        "Competitive Programming",
        "Web Development",
        "App Development",
        "Machine Learning",
        "FOSS",
        "InfoSec"
    ];

    const toggleWing = (wing: string) => {
        if (wing === "Competitive Programming") return; // Mandatory

        if (selectedWings.includes(wing)) {
            setSelectedWings(selectedWings.filter(w => w !== wing));
        } else {
            setSelectedWings([...selectedWings, wing]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:8081/api/auth/register', {
                ...formData,
                wings: selectedWings
            });
            navigate('/login');
        } catch (err: any) {
            console.error("Registration failed", err);
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#030014] p-4">
            <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-md text-white my-10">
                <CardHeader>
                    <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Join Axios</CardTitle>
                    <CardDescription className="text-center text-gray-400">Enter your details to register</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" onChange={handleChange} required className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">College Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@college.edu" onChange={handleChange} required className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" onChange={handleChange} required className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="college_id">College ID</Label>
                            <Input id="college_id" name="college_id" onChange={handleChange} required className="bg-white/5 border-white/10" />
                        </div>

                        <div className="space-y-2">
                            <Label>Interested Wings <span className="text-red-500">*</span></Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {WINGS.map(wing => (
                                    <button
                                        key={wing}
                                        type="button"
                                        onClick={() => toggleWing(wing)}
                                        className={`px-3 py-1.5 rounded-full text-xs transition-all border ${selectedWings.includes(wing)
                                            ? "bg-purple-600/20 border-purple-500 text-purple-300"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            } ${wing === "Competitive Programming" ? "cursor-not-allowed opacity-80" : ""}`}
                                    >
                                        {wing}
                                        {wing === "Competitive Programming" && " (Required)"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-white/10">
                            <h3 className="text-sm font-semibold text-gray-300">Profile Handles</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="codeforces_handle">Codeforces <span className="text-red-500">*</span></Label>
                                    <Input id="codeforces_handle" name="codeforces_handle" onChange={handleChange} required className="bg-white/5 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="github_handle">GitHub <span className="text-red-500">*</span></Label>
                                    <Input id="github_handle" name="github_handle" onChange={handleChange} required className="bg-white/5 border-white/10" />
                                </div>
                            </div>

                            {selectedWings.includes("Machine Learning") && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="kaggle_handle">Kaggle Handle <span className="text-red-500">*</span></Label>
                                    <Input id="kaggle_handle" name="kaggle_handle" placeholder="Kaggle Username" onChange={handleChange} required className="bg-white/5 border-white/10" />
                                </div>
                            )}

                            {selectedWings.includes("InfoSec") && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="ctf_handle">CTF Detail / Handle <span className="text-red-500">*</span></Label>
                                    <Input id="ctf_handle" name="ctf_handle" placeholder="TryHackMe / HackTheBox Handle" onChange={handleChange} required className="bg-white/5 border-white/10" />
                                </div>
                            )}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none mt-6">
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-400">Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Login</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;

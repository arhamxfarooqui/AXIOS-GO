import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "@/context/AuthContext";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:8081/api/auth/login', formData);
            login(response.data.token, response.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.response?.data?.error || "Invalid email or password");
        }
    };

    return (
        <div className="flex items-center justify-center flex-1 bg-[#030014] p-4">
            <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-md text-white">
                <CardHeader>
                    <CardTitle className="text-2xl text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Welcome Back</CardTitle>
                    <CardDescription className="text-center text-gray-400">Login to access your wing stats</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">College Email</Label>
                            <Input id="email" name="email" type="email" placeholder="john@college.edu" onChange={handleChange} required className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" onChange={handleChange} required className="bg-white/5 border-white/10" />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none mt-4">Login</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-400">Don't have an account? <Link to="/register" className="text-purple-400 hover:underline">Register</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;

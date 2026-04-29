import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';

const WINGS = ["Overall", "CP", "Dev", "ML", "Sec"];

const Leaderboard = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [currentWing, setCurrentWing] = useState("Overall");

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                let url = 'http://localhost:8081/api/public/leaderboard';
                if (currentWing !== "Overall") {
                    url += `/wing?wing=${currentWing.toLowerCase()}`;
                }
                const response = await axios.get(url);
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
                setUsers([]);
            }
        };

        fetchLeaderboard();
    }, [currentWing]);

    return (
        <div className="container mx-auto p-6 min-h-screen">
            <div className="flex flex-col space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">Leaderboard</h1>
                    <p className="text-gray-400">See who is leading the charts across different wings</p>
                </div>

                <div className="flex justify-center">
                    <Tabs defaultValue="Overall" className="w-full max-w-4xl" onValueChange={setCurrentWing}>
                        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 bg-white/5 border border-white/10">
                            {WINGS.map(wing => (
                                <TabsTrigger key={wing} value={wing} className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                                    {wing}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={currentWing} className="mt-6">
                            <Card className="bg-black/40 border-white/10 backdrop-blur text-white">
                                <CardHeader>
                                    <CardTitle>{currentWing} Rankings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader className="hover:bg-transparent">
                                            <TableRow className="hover:bg-transparent border-white/10">
                                                <TableHead className="text-gray-400 w-[80px]">Rank</TableHead>
                                                <TableHead className="text-gray-400">Name</TableHead>
                                                <TableHead className="text-gray-400 text-center">
                                                    {currentWing === "CP" ? "CF Rating" : currentWing === "Dev" ? "Repos" : "Solved"}
                                                </TableHead>
                                                <TableHead className="text-gray-400 text-right">Axios Rating</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.length > 0 ? (
                                                users.map((user, index) => (
                                                    <TableRow key={user.ID} className="border-white/10 hover:bg-white/5 transition-colors">
                                                        <TableCell className="font-medium">
                                                            {index < 3 ? (
                                                                <span className="flex items-center gap-2">
                                                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                                                                    {index + 1}
                                                                </span>
                                                            ) : index + 1}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-purple-200">{user.name}</TableCell>
                                                        <TableCell className="text-center text-gray-300">
                                                            {currentWing === "CP" ? user.codeforces_rating : 
                                                             currentWing === "Dev" ? user.github_repos : 
                                                             user.total_solved}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-cyan-400">
                                                            {user.axios_rating}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow className="hover:bg-transparent">
                                                    <TableCell colSpan={4} className="text-center h-24 text-gray-500">
                                                        No data available yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

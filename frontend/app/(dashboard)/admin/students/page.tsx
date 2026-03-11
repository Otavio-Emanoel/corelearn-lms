"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";

interface Student {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function loadStudents() {
        const data = await apiClient.get<Student[]>("/students");
        setStudents(data);
    }

    useEffect(() => {
        loadStudents();
    }, []);

    async function handleCreate() {
        setError(null);
        try {
            await apiClient.post("/students", { name, email, password });
            setName("");
            setEmail("");
            setPassword("");
            setOpen(false);
            loadStudents();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create student");
        }
    }

    async function handleDelete(id: string) {
        await apiClient.delete(`/students/${id}`);
        loadStudents();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Students</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your apprentices</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-1 h-4 w-4" /> Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Student</DialogTitle>
                            <DialogDescription>Create a student account linked to your tenant</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="s-name">Name</Label>
                                <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="João Silva" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="s-email">Email</Label>
                                <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="joao@example.com" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="s-pass">Password</Label>
                                <Input id="s-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Student</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
                    <Users className="h-12 w-12 text-muted-foreground/40" />
                    <p className="mt-4 text-muted-foreground">No students yet</p>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Joined</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, i) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{student.email}</td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button size="sm" variant="ghost" className="text-destructive h-8" onClick={() => handleDelete(student.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

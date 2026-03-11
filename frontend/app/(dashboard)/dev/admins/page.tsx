"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";

interface Admin {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export default function AdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function load() {
        const data = await apiClient.get<Admin[]>("/dev/admins");
        setAdmins(data);
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate() {
        setError(null);
        try {
            await apiClient.post("/dev/admins", { name, email, password });
            setName("");
            setEmail("");
            setPassword("");
            setOpen(false);
            load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create admin");
        }
    }

    async function handleDelete(id: string) {
        await apiClient.delete(`/dev/admins/${id}`);
        load();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Admin Management</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage tenant administrators (clients)</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-1 h-4 w-4" /> New Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Admin</DialogTitle>
                            <DialogDescription>This will create a new tenant administrator account</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="a-name">Name</Label>
                                <Input id="a-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Breno Silva" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="a-email">Email</Label>
                                <Input id="a-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="breno@company.com" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="a-pass">Password</Label>
                                <Input id="a-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Create Admin</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {admins.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
                    <Shield className="h-12 w-12 text-muted-foreground/40" />
                    <p className="mt-4 text-muted-foreground">No admins yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {admins.map((admin, i) => (
                        <motion.div
                            key={admin.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="rounded-xl border border-border bg-card p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold">{admin.name}</h3>
                                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Joined {new Date(admin.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(admin.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

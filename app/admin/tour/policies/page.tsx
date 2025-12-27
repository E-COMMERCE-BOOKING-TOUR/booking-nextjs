"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTourApi } from '@/apis/admin/tour';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ShieldCheck, Clock, Percent, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ITourPolicy, ITourPolicyRule } from '@/types/admin/tour.dto';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function AdminTourPoliciesPage() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const queryClient = useQueryClient();

    // For now, use supplier ID 1 as default. 
    // In a real app, this should come from the logged-in user's profile.
    const [supplierId] = useState(1);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<ITourPolicy | null>(null);
    const [policyForm, setPolicyForm] = useState<ITourPolicy>({
        name: '',
        rules: [{ before_hours: 24, fee_pct: 0, sort_no: 1 }],
        supplier_id: supplierId
    });

    const { data: policies = [], isLoading } = useQuery({
        queryKey: ['admin-policies', supplierId],
        queryFn: () => adminTourApi.getPoliciesBySupplier(supplierId, token),
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: (data: ITourPolicy) => adminTourApi.createPolicy(data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-policies'] });
            toast.success('Policy created successfully');
            setIsDialogOpen(false);
        },
        onError: (err: any) => toast.error(err.message || 'Error creating policy')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: Partial<ITourPolicy> }) =>
            adminTourApi.updatePolicy(id, data, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-policies'] });
            toast.success('Policy updated successfully');
            setIsDialogOpen(false);
        },
        onError: (err: any) => toast.error(err.message || 'Error updating policy')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => adminTourApi.removePolicy(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-policies'] });
            toast.success('Policy deleted successfully');
        },
        onError: (err: any) => toast.error(err.message || 'Error deleting policy')
    });

    const handleOpenDialog = (policy?: ITourPolicy) => {
        if (policy) {
            setEditingPolicy(policy);
            setPolicyForm({ ...policy });
        } else {
            setEditingPolicy(null);
            setPolicyForm({
                name: '',
                rules: [{ before_hours: 24, fee_pct: 0, sort_no: 1 }],
                supplier_id: supplierId
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!policyForm.name.trim()) {
            toast.error('Policy name is required');
            return;
        }
        if (policyForm.rules.length === 0) {
            toast.error('At least one rule is required');
            return;
        }

        if (editingPolicy?.id) {
            const { id, ...data } = policyForm;
            updateMutation.mutate({ id: id as number, data });
        } else {
            createMutation.mutate(policyForm);
        }
    };

    const addRule = () => {
        setPolicyForm({
            ...policyForm,
            rules: [...policyForm.rules, { before_hours: 0, fee_pct: 100, sort_no: policyForm.rules.length + 1 }]
        });
    };

    const removeRule = (idx: number) => {
        setPolicyForm({
            ...policyForm,
            rules: policyForm.rules.filter((_, i) => i !== idx)
        });
    };

    const updateRule = (idx: number, field: keyof ITourPolicyRule, value: number) => {
        const newRules = [...policyForm.rules];
        newRules[idx] = { ...newRules[idx], [field]: value };
        setPolicyForm({ ...policyForm, rules: newRules });
    };

    const formatTime = (hours: number) => {
        if (hours === 0) return 'at start time';
        if (hours % 24 === 0) {
            const days = hours / 24;
            return `${days} ${days === 1 ? 'day' : 'days'}`;
        }
        return `${hours} hours`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Refund Policies</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage shared refund and cancellation policies for your tours.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 shadow-sm gap-2">
                    <Plus className="size-4" /> Create Policy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse h-48 bg-card/50" />
                    ))
                ) : policies.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-xl bg-card/20">
                        <ShieldCheck className="size-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="font-semibold text-lg">No Policies Found</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                            Create your first refund policy to start assigning it to tour variants.
                        </p>
                    </div>
                ) : (policies as ITourPolicy[]).map((policy) => (
                    <Card key={policy.id} className="border-none shadow-md bg-card/50 backdrop-blur-sm group hover:ring-1 hover:ring-primary/20 transition-all">
                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                            <div className="min-w-0">
                                <CardTitle className="text-xl uppercase tracking-tight truncate">{policy.name}</CardTitle>
                                <CardDescription className="text-xs">ID: {policy.id}</CardDescription>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenDialog(policy)}>
                                    <Edit className="size-4 text-primary" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => {
                                    if (confirm('Delete this policy?')) deleteMutation.mutate(policy.id!);
                                }}>
                                    <Trash2 className="size-4 text-destructive" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {([...(policy.rules || [])]).sort((a, b) => b.before_hours - a.before_hours).map((rule, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <Clock className="size-3 text-muted-foreground" />
                                            <span>{rule.before_hours > 0 ? `> ${formatTime(rule.before_hours)} before` : formatTime(rule.before_hours)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-semibold text-primary">
                                            <span>{rule.fee_pct}%</span>
                                            <span className="text-[10px] uppercase font-normal text-muted-foreground">Fee</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Configure cancellation rules. Rules will be applied based on the time of cancellation.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Policy Name</Label>
                            <Input
                                id="name"
                                value={policyForm.name}
                                onChange={e => setPolicyForm({ ...policyForm, name: e.target.value })}
                                placeholder="e.g. Flexible Cancellation"
                                className="bg-white/5 border-white/10 focus:ring-primary/50 text-white"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Cancellation Rules</Label>
                                <Button type="button" variant="outline" size="sm" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10" onClick={addRule}>
                                    <Plus className="size-3 mr-1" /> Add Rule
                                </Button>
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                {([...(policyForm.rules || [])]).sort((a, b) => b.before_hours - a.before_hours).map((rule, idx) => (
                                    <div key={idx} className="flex items-end gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div className="space-y-1.5 flex-1">
                                            <Label className="text-[10px] text-slate-400 uppercase">Hours Before {rule.before_hours > 0 && `(${formatTime(rule.before_hours)})`}</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                                                <Input
                                                    type="number"
                                                    value={rule.before_hours}
                                                    onChange={e => updateRule(idx, 'before_hours', parseInt(e.target.value))}
                                                    className="h-8 pl-7 bg-transparent border-white/10 text-xs text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 flex-1">
                                            <Label className="text-[10px] text-slate-400 uppercase">Fee (%)</Label>
                                            <div className="relative">
                                                <Percent className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
                                                <Input
                                                    type="number"
                                                    value={rule.fee_pct}
                                                    onChange={e => updateRule(idx, 'fee_pct', parseInt(e.target.value))}
                                                    className="h-8 pl-7 bg-transparent border-white/10 text-xs text-white"
                                                />
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => removeRule(idx)}>
                                            <Trash2 className="size-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:bg-white/5">Cancel</Button>
                        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                            <Save className="size-4 mr-2" /> {editingPolicy ? 'Update Policy' : 'Create Policy'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

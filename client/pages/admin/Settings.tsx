import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, UserPlus, UserMinus, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProfiles, updateUserAdminStatus } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function SettingsAdmin() {
  const queryClient = useQueryClient();

  // Fetch all profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await getAllProfiles();
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation to update admin status
  const updateAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      updateUserAdminStatus(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast.success("Admin status updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update admin status: ${error.message}`);
    },
  });

  const handleAdminToggle = (userId: string, currentStatus: boolean) => {
    updateAdminMutation.mutate({ userId, isAdmin: !currentStatus });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your store settings and manage administrators
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input id="store-name" defaultValue="Fashion Store" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">Contact Email</Label>
              <Input id="store-email" type="email" defaultValue="contact@fashionstore.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">Phone Number</Label>
              <Input id="store-phone" defaultValue="+1 (555) 123-4567" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shipping-fee">Standard Shipping Fee</Label>
              <Input id="shipping-fee" type="number" step="0.01" defaultValue="9.99" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="free-shipping">Free Shipping Threshold</Label>
              <Input id="free-shipping" type="number" step="0.01" defaultValue="100.00" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="py-4 text-center text-muted-foreground">
              Payment gateway configuration coming soon...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input id="tax-rate" type="number" step="0.01" defaultValue="8.5" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administrator Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage which users have administrator privileges. The email korantengabrahamagyei@gmail.com is automatically set as admin.
          </p>
        </CardHeader>
        <CardContent>
          {profilesLoading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No user profiles found. Users will appear here after they sign up.
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile: any) => (
                <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{profile.full_name || "No name"}</p>
                      <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    </div>
                    {profile.is_admin && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`admin-${profile.id}`} className="text-sm">
                      Admin Access
                    </Label>
                    <Switch
                      id={`admin-${profile.id}`}
                      checked={profile.is_admin || false}
                      onCheckedChange={() => handleAdminToggle(profile.id, profile.is_admin)}
                      disabled={updateAdminMutation.isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
import { useTheme } from "@/context/ThemeContext";
import { Palette, Type, LayoutTemplate } from "lucide-react";

export default function SettingsAdmin() {
  const queryClient = useQueryClient();
  const { theme, updateTheme, resetTheme } = useTheme();

  // Pre-defined color schemes
  const colorSchemes = [
    { name: "Navy (Default)", value: "217 32% 17%", hex: "#1e293b" },
    { name: "Emerald", value: "142 71% 45%", hex: "#10b981" },
    { name: "Violet", value: "262 83% 58%", hex: "#8b5cf6" },
    { name: "Rose", value: "343 87% 55%", hex: "#f43f5e" },
    { name: "Amber", value: "45 93% 47%", hex: "#f59e0b" },
    { name: "Midnight", value: "222 47% 11%", hex: "#0f172a" },
  ];

  // Fonts
  const fonts = [
    { name: "Modern Sans (Inter)", value: "'Inter', sans-serif" },
    { name: "Classic Serif (Playfair)", value: "'Playfair Display', serif" },
    { name: "System UI", value: "system-ui, -apple-system, sans-serif" },
  ];

  // Radii
  const radii = [
    { name: "Sharp", value: "0rem" },
    { name: "Slight", value: "0.25rem" },
    { name: "Standard", value: "0.5rem" },
    { name: "Rounded", value: "1rem" },
  ];


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
        {/* Appearance Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Site Appearance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize the look and feel of your store. Changes apply immediately.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Primary Color Theme
                </Label>
                <Button variant="outline" size="sm" onClick={resetTheme}>Reset to Default</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.name}
                    onClick={() => updateTheme({ primaryColor: scheme.value })}
                    className={`flex items-center gap-3 p-3 rounded-md border transition-all ${theme.primaryColor === scheme.value
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div
                      className="h-6 w-6 rounded-full shadow-sm border border-black/10"
                      style={{ backgroundColor: scheme.hex }}
                    />
                    <span className="text-sm font-medium">{scheme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  Font Family
                </Label>
                <div className="space-y-2">
                  {fonts.map((font) => (
                    <button
                      key={font.name}
                      onClick={() => updateTheme({ fontFamily: font.value })}
                      className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all ${theme.fontFamily === font.value
                          ? "border-primary ring-1 ring-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                        }`}
                    >
                      <span className="text-sm font-medium">{font.name}</span>
                      <span className="text-xs text-muted-foreground" style={{ fontFamily: font.value }}>
                        Aa Bb Cc
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                  Border Radius
                </Label>
                <div className="space-y-2">
                  {radii.map((radius) => (
                    <button
                      key={radius.name}
                      onClick={() => updateTheme({ radius: radius.value })}
                      className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all ${theme.radius === radius.value
                          ? "border-primary ring-1 ring-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                        }`}
                    >
                      <span className="text-sm font-medium">{radius.name}</span>
                      <div className="h-4 w-12 border border-gray-400 bg-gray-100" style={{ borderRadius: radius.value }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

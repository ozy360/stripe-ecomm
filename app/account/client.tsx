"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserIcon,
  MapPinIcon,
  GearIcon,
  CircleNotchIcon,
  FloppyDiskIcon,
  PlusIcon,
  TrashIcon,
  HouseIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAccountData,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  updatePreferences,
} from "./actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface ProfileData {
  fullname: string;
  email: string;
  phone: string;
}

interface Preferences {
  currency: string;
  language: string;
}

type AddressFormData = Omit<Address, "_id"> & { _id?: string };

const DEFAULT_ADDRESS_FORM: AddressFormData = {
  label: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  isDefault: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccountClient() {
  const router = useRouter();

  // Separate loading states per section
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullname: "",
    email: "",
    phone: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [preferences, setPreferences] = useState<Preferences>({
    currency: "USD",
    language: "en",
  });

  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addressForm, setAddressForm] =
    useState<AddressFormData>(DEFAULT_ADDRESS_FORM);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchAccountData = useCallback(async () => {
    const data = await getAccountData();

    if (data) {
      setProfileData({
        fullname: data.fullname || "",
        email: data.email || "",
        phone: data.phone || "",
      });
      setAddresses(data.shippingAddresses || []);
      if (data.preferences) {
        setPreferences({
          currency: data.preferences.currency || "USD",
          language: data.preferences.language || "en",
        });
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsPageLoading(true);
      await fetchAccountData();
      setIsPageLoading(false);
    };
    init();
  }, [fetchAccountData]);

  // ─── Profile ────────────────────────────────────────────────────────────────

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    const result = await updateProfile(profileData);
    if (result.success) {
      toast.success("Profile updated successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setIsLoadingProfile(false);
  };

  // ─── Addresses ──────────────────────────────────────────────────────────────

  const openAddressDialog = (address?: Address) => {
    if (address) {
      setAddressForm({ ...address });
      setIsEditingAddress(true);
    } else {
      setAddressForm(DEFAULT_ADDRESS_FORM);
      setIsEditingAddress(false);
    }
    setIsAddressDialogOpen(true);
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAddress(true);

    const result = isEditingAddress
      ? await updateAddress(addressForm._id!, addressForm)
      : await addAddress(addressForm);

    if (result.success) {
      toast.success(
        isEditingAddress
          ? "Address updated successfully"
          : "Address added successfully",
      );
      setIsAddressDialogOpen(false);

      // Optimistic update: re-fetch addresses only
      const data = await getAccountData();
      if (data) setAddresses(data.shippingAddresses || []);

      router.refresh();
    } else {
      toast.error(result.error || "Failed to save address");
    }
    setIsLoadingAddress(false);
  };

  const handleAddressDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    // Optimistic removal
    setAddresses((prev) => prev.filter((addr) => addr._id !== id));

    const result = await deleteAddress(id);
    if (result.success) {
      toast.success("Address removed");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to remove address");
      // Rollback on failure
      await fetchAccountData();
    }
  };

  // ─── Preferences ────────────────────────────────────────────────────────────

  const handlePreferencesSave = async () => {
    setIsLoadingPreferences(true);
    const result = await updatePreferences(preferences);
    if (result.success) {
      toast.success("Preferences saved");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save preferences");
    }
    setIsLoadingPreferences(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <CircleNotchIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Account Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your personal details, shipping addresses, and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPinIcon className="mr-2 h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <GearIcon className="mr-2 h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={profileData.fullname}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          fullname: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter className="mt-5">
                  <Button type="submit" disabled={isLoadingProfile}>
                    {isLoadingProfile ? (
                      <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FloppyDiskIcon className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* ── Addresses Tab ── */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Shipping Addresses</CardTitle>
                  <CardDescription>
                    Manage your saved shipping addresses.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAddressDialog()}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add New
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                    <MapPinIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                    <p className="font-medium text-muted-foreground">
                      No addresses saved yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground/70">
                      Add a shipping address to speed up checkout.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => openAddressDialog()}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <HouseIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{address.label}</span>
                          {address.isDefault && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.street}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}, {address.state} {address.zip}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.country}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAddressDialog(address)}
                        >
                          <PencilSimpleIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleAddressDelete(address._id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Preferences Tab ── */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your shopping experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Currency</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(val) =>
                      setPreferences({ ...preferences, currency: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(val) =>
                      setPreferences({ ...preferences, language: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handlePreferencesSave}
                  disabled={isLoadingPreferences}
                >
                  {isLoadingPreferences ? (
                    <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FloppyDiskIcon className="mr-2 h-4 w-4" />
                  )}
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Address Dialog ── */}
        <Dialog
          open={isAddressDialogOpen}
          onOpenChange={setIsAddressDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
              <DialogDescription>
                Enter your shipping address details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddressSave}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="label">Label (e.g. Home, Work)</Label>
                  <Input
                    id="label"
                    value={addressForm.label}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, label: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    required
                    value={addressForm.street}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, street: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      required
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input
                      id="zip"
                      required
                      value={addressForm.zip}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, zip: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      required
                      value={addressForm.country}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        isDefault: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="isDefault">Set as default address</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddressDialogOpen(false)}
                  disabled={isLoadingAddress}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoadingAddress}>
                  {isLoadingAddress ? (
                    <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FloppyDiskIcon className="mr-2 h-4 w-4" />
                  )}
                  Save Address
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

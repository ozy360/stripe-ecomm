'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DotsThreeOutlineIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';

import { getUsers, getUser, updateUser, searchUsers } from './actions';

// Define Types
interface ShippingAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  id?: string;
  fullname: string;
  email: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  shippingAddresses: ShippingAddress[];
  wishlist: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, statusFilter, verificationFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await getUsers();
      setUsers(usersData as any);
      setFilteredUsers(usersData as any);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = users;

    // Apply search
    if (searchQuery.trim()) {
      const searchResults = await searchUsers(searchQuery);
      filtered = searchResults as any;
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (user) => user.isActive === (statusFilter === 'active'),
      );
    }

    // Apply verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(
        (user) => user.emailVerified === (verificationFilter === 'verified'),
      );
    }

    setFilteredUsers(filtered);
  };

  const handleViewDetails = async (user: User) => {
    const userId = user._id || user.id;
    if (!userId) return;

    try {
      const userDetails = await getUser(userId);
      if (userDetails) {
        setSelectedUser(userDetails as any);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error loading user details');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const userId = selectedUser?._id || selectedUser?.id;
    if (!userId) return;

    const userData = {
      fullname: formData.get('fullname') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      isActive: formData.get('isActive') === 'on',
      // emailVerified: formData.get('emailVerified') === 'on',
    };

    try {
      const result = await updateUser(userId, userData);

      if (result.success) {
        setIsDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setVerificationFilter('all');
  };

  const renderActionsMenu = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <DotsThreeOutlineIcon className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="grid gap-2">
          <DropdownMenuItem
            className="w-full cursor-pointer justify-start focus:outline-none"
            onClick={() => handleViewDetails(user)}
          >
            <UserIcon className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="min-w-[250px] flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification Filter */}
          <div>
            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            statusFilter !== 'all' ||
            verificationFilter !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and update user information
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <form onSubmit={handleUpdateUser}>
              <div className="grid gap-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Basic Information</h3>

                  <div className="grid gap-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      name="fullname"
                      defaultValue={selectedUser.fullname}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={selectedUser.email}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={selectedUser.phone || ''}
                    />
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive">Active Account</Label>
                      <div className="text-sm text-gray-500">
                        Allow user to access their account
                      </div>
                    </div>
                    <Switch
                      id="isActive"
                      name="isActive"
                      defaultChecked={selectedUser.isActive}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailVerified">Email Verified</Label>
                      <div className="text-sm text-gray-500">
                        Mark email as verified
                      </div>
                    </div>
                    <Switch
                      id="emailVerified"
                      name="emailVerified"
                      defaultChecked={selectedUser.emailVerified}
                    />
                  </div>
                </div>

                {/* Shipping Addresses */}
                {selectedUser.shippingAddresses &&
                  selectedUser.shippingAddresses.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">
                        Shipping Addresses
                      </h3>
                      <div className="space-y-3">
                        {selectedUser.shippingAddresses.map(
                          (address, index) => (
                            <div
                              key={address._id || index}
                              className="rounded-lg border p-3 text-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">
                                      {address.fullName}
                                    </span>
                                    {address.isDefault && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-gray-600">
                                    {address.street}
                                    {address.apartment &&
                                      `, ${address.apartment}`}
                                  </div>
                                  <div className="text-gray-600">
                                    {address.city}, {address.state}{' '}
                                    {address.zipCode}
                                  </div>
                                  <div className="text-gray-600">
                                    {address.country}
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <PhoneIcon className="h-3 w-3" />
                                    {address.phone}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Account Dates */}
                <div className="space-y-4">
                  {/* <h3 className="text-sm font-semibold">Account Information</h3> */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Account Created</Label>
                      <div className="text-sm text-gray-600">
                        {formatDate(selectedUser.createdAt)}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Last Updated</Label>
                      <div className="text-sm text-gray-600">
                        {formatDate(selectedUser.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id || user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      {user.fullname}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        {user.phone}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        <CheckCircleIcon className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        <XCircleIcon className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {renderActionsMenu(user)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

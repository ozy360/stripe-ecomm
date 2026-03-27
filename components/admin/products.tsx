'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  PencilSimpleIcon,
  TrashIcon,
  DotsThreeOutlineIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FolderSimpleIcon,
  TagIcon,
  WarningCircleIcon,
  CircleNotchIcon,
} from '@phosphor-icons/react';
import { PictureUpload } from '../pictureupload';

import {
  getProducts,
  deleteProduct,
  toggleProductStatus,
  searchProducts,
  getProductsByCategory,
  getActiveProducts,
  getLowStockProducts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './actions';

// Define Types
interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: Array<{ url: string; deleteHash: string }>;
  category: string[];
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryStats {
  _id: string;
  name: string;
  count: number;
  activeCount: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isProductDialogOpen, setIsProductDialogOpen] =
    useState<boolean>(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] =
    useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Category management states
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<CategoryStats | null>(
    null,
  );
  const [selectedCategoryForDelete, setSelectedCategoryForDelete] =
    useState<string>('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showLowStock, setShowLowStock] = useState<boolean>(false);

  // Form ref
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedCategory, statusFilter, showLowStock]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const productsData = await getProducts();
      setProducts(productsData as Product[]);
      setFilteredProducts(productsData as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFilters = async () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const searchResults = await searchProducts(searchQuery);
      filtered = searchResults as Product[];
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) =>
        product.category.includes(selectedCategory),
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((product) => product.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((product) => !product.isActive);
    }

    // Low stock filter
    if (showLowStock) {
      filtered = filtered.filter((product) => product.stock <= 10);
    }

    setFilteredProducts(filtered);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setUploadedFiles([]);
    setIsProductDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    const id = product._id || product.id;
    if (id && confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          fetchProducts();
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleStatusToggle = async (product: Product) => {
    const id = product._id || product.id;
    if (!id) return;
    try {
      const result = await toggleProductStatus(id, product.isActive);
      if (result.success) {
        fetchProducts();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const form = e.currentTarget;
    const formData = new FormData();

    // Add text fields
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const description = (
      form.elements.namedItem('description') as HTMLTextAreaElement
    ).value;
    const price = (form.elements.namedItem('price') as HTMLInputElement).value;
    const stock = (form.elements.namedItem('stock') as HTMLInputElement).value;

    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);

    // Handle isActive from Switch
    const isActiveSwitch = form.querySelector(
      'button[role="switch"]',
    ) as HTMLButtonElement | null;
    if (isActiveSwitch) {
      const isChecked = isActiveSwitch.getAttribute('data-state') === 'checked';
      formData.append('isActive', isChecked.toString());
    }

    // Get category from select
    const categorySelect = form.querySelector(
      'select[name="category"]',
    ) as HTMLSelectElement;
    if (categorySelect && categorySelect.value) {
      formData.append('category', categorySelect.value);
    }

    // Add uploaded files
    uploadedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      let result;
      const productId = editingProduct?._id || editingProduct?.id;

      if (editingProduct && productId) {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          body: formData,
        });
        result = await response.json();
      } else {
        const response = await fetch('/api/products', {
          method: 'POST',
          body: formData,
        });
        result = await response.json();
      }

      if (result.success) {
        setIsProductDialogOpen(false);
        setEditingProduct(null);
        setUploadedFiles([]);
        fetchProducts();
        fetchCategories();
        form.reset();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Category Management Functions
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      const result = await createCategory(newCategoryName);
      if (result.success) {
        setNewCategoryName('');
        fetchCategories();
        alert('Category created successfully');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditCategory = async (category: CategoryStats) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setIsCategoryDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      // Call the server action to update category using _id
      const result = await updateCategory(
        editingCategory._id,
        newCategoryName.trim(),
      );

      if (!result.success) {
        alert(`Error: ${result.error}`);
        return;
      }

      // Refresh data
      await fetchProducts();
      await fetchCategories();

      // Reset state
      setEditingCategory(null);
      setNewCategoryName('');
      setIsCategoryDialogOpen(false);

      alert(result.message || 'Category updated successfully');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    // Find the category by name to get its _id
    const category = categories.find((cat) => cat.name === categoryName);
    if (!category) {
      alert('Category not found');
      return;
    }

    setSelectedCategoryForDelete(categoryName);

    // Check if category has products
    if (category.count > 0) {
      const confirmDelete = confirm(
        `This category has ${category.count} product(s). Deleting it is not allowed while products are using it. Would you like to reassign these products to another category first?`,
      );

      if (!confirmDelete) {
        setSelectedCategoryForDelete('');
        return;
      }

      // If user wants to reassign, show options
      const moveTo = prompt(
        `Enter a category name to move the ${category.count} product(s) to:`,
      );

      if (moveTo === null) {
        // User cancelled
        setSelectedCategoryForDelete('');
        return;
      }

      if (!moveTo.trim()) {
        alert('You must specify a category to move products to');
        setSelectedCategoryForDelete('');
        return;
      }

      // Update all products with this category
      try {
        const productsToUpdate = products.filter((product) =>
          product.category.includes(categoryName),
        );

        for (const product of productsToUpdate) {
          const updatedCategories = product.category.map((cat) =>
            cat === categoryName ? moveTo.trim() : cat,
          );

          const formData = new FormData();
          formData.append('name', product.name);
          formData.append('description', product.description);
          formData.append('price', product.price.toString());
          formData.append('category', updatedCategories.join(','));
          formData.append('stock', product.stock.toString());
          formData.append('isActive', product.isActive.toString());

          await fetch(`/api/products/${product._id || product.id!}`, {
            method: 'PUT',
            body: formData,
          });
        }

        // Now try to delete the category using its _id
        const result = await deleteCategory(category._id);

        if (!result.success) {
          alert(`Error: ${result.error}`);
          setSelectedCategoryForDelete('');
          return;
        }

        await fetchProducts();
        await fetchCategories();
        alert(result.message || 'Category deleted successfully');
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    } else {
      // No products using this category, safe to delete
      const confirmDelete = confirm(
        `Are you sure you want to delete the category "${categoryName}"?`,
      );

      if (!confirmDelete) {
        setSelectedCategoryForDelete('');
        return;
      }

      try {
        // Use category._id for deletion
        const result = await deleteCategory(category._id);

        if (!result.success) {
          alert(`Error: ${result.error}`);
          setSelectedCategoryForDelete('');
          return;
        }

        await fetchProducts();
        await fetchCategories();
        alert(result.message || 'Category deleted successfully');
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    }

    setSelectedCategoryForDelete('');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setStatusFilter('all');
    setShowLowStock(false);
  };

  const renderActionsMenu = (product: Product) => (
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
            onClick={() => handleEdit(product)}
          >
            <PencilSimpleIcon className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="w-full cursor-pointer justify-start focus:outline-none"
            onClick={() => handleStatusToggle(product)}
          >
            <WarningCircleIcon className="mr-2 h-4 w-4" />
            {product.isActive ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="w-full cursor-pointer justify-start text-red-500 hover:bg-red-50 hover:text-red-600 focus:outline-none"
            onClick={() => handleDelete(product)}
          >
            <TrashIcon className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setUploadedFiles([]);
            setIsProductDialogOpen(true);
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="min-w-[200px] flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter with Manage Button */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName('');
              setIsCategoryDialogOpen(true);
            }}
            title="Manage Categories"
          >
            <FolderSimpleIcon className="h-4 w-4" />
          </Button>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Low Stock Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="low-stock"
              checked={showLowStock}
              onCheckedChange={setShowLowStock}
            />
            <Label htmlFor="low-stock" className="cursor-pointer">
              Low Stock Only
            </Label>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          {isSaving ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CircleNotchIcon className="h-12 w-12 animate-spin text-gray-400" />
              <p className="mt-4 text-sm text-gray-500">Saving...</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? 'Update the product details'
                    : 'Fill in the details to add a new product to your store.'}
                </DialogDescription>
              </DialogHeader>

              <form ref={formRef} onSubmit={handleSaveProduct}>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label>Product Images</Label>
                    <PictureUpload
                      onUpload={handleUpload}
                      maxFiles={5}
                      accept={{ 'image/*': [] }}
                      defaultValue={
                        editingProduct?.images?.map((img) => img.url) ||
                        (editingProduct?.image ? [editingProduct.image] : [])
                      }
                      name="images"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        defaultValue={editingProduct?.name || ''}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <div className="flex gap-2">
                        <Select
                          name="category"
                          defaultValue={editingProduct?.category?.[0] || ''}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.name}
                                value={category.name}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingCategory(null);
                            setNewCategoryName('');
                            setIsCategoryDialogOpen(true);
                          }}
                          title="Manage Categories"
                        >
                          <FolderSimpleIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      defaultValue={editingProduct?.description || ''}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">
                        Price <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        required
                        defaultValue={editingProduct?.price || ''}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stock">
                        Stock <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        required
                        defaultValue={editingProduct?.stock || 0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Active Status</Label>
                    </div>
                    <Switch
                      name="isActive"
                      defaultChecked={editingProduct?.isActive ?? true}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsProductDialogOpen(false);
                      setUploadedFiles([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Manage Categories'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Edit the category name'
                : 'Create, edit, or delete product categories'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Add/Edit Category Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editingCategory) {
                          handleUpdateCategory();
                        } else {
                          handleCreateCategory();
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={
                    editingCategory
                      ? handleUpdateCategory
                      : handleCreateCategory
                  }
                  disabled={!newCategoryName.trim()}
                >
                  {editingCategory ? 'Update' : 'Add'}
                </Button>
              </div>

              {editingCategory && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryName('');
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </div>

            {/* Categories List */}
            {!editingCategory && (
              <div className="space-y-2">
                <Label>Existing Categories</Label>
                <div className="max-h-60 overflow-y-auto rounded-md border">
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      No categories yet. Create your first category above.
                    </div>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category.name}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{category.name}</span>
                          <span className="text-sm text-gray-500">
                            ({category.count} products, {category.activeCount}{' '}
                            active)
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            disabled={
                              selectedCategoryForDelete === category.name
                            }
                          >
                            <PencilSimpleIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteCategory(category.name)}
                            disabled={
                              selectedCategoryForDelete === category.name
                            }
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id || product.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-gray-100">
                      {product.image || product.images?.[0]?.url ? (
                        <img
                          src={product.image || product.images?.[0]?.url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No image</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.category.map((cat) => (
                          <Badge key={cat} variant="secondary">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        product.stock <= 10 ? 'font-semibold text-red-600' : ''
                      }
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {renderActionsMenu(product)}
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

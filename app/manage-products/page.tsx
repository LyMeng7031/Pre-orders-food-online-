"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Package,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/FormField";
import { Input, Textarea, Select } from "@/components/ui/FormField";
import Modal from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";

// --- CONSTANTS & INTERFACES ---

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparationTime: number;
  spicyLevel: number;
  ingredients: string[];
  allergens: string[];
  image: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const CATEGORIES = [
  { value: "MEALS", label: "MEALS" },
  { value: "DRINKS", label: "DRINKS" },
  { value: "SNACKS", label: "SNACKS" },
  { value: "DESSERTS", label: "DESSERTS" },
  { value: "APPETIZERS", label: "APPETIZERS" },
];

const SPICY_LEVELS = [
  { value: "0", label: "Not Spicy" },
  { value: "1", label: "Mild" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Hot" },
  { value: "4", label: "Very Hot" },
  { value: "5", label: "Extremely Hot" },
];

// --- EXTRACTED FORM COMPONENT (Prevents focus loss) ---

interface ProductFormProps {
  isEdit?: boolean;
  formData: any;
  setFormData: any;
  imagePreview: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  errors: Record<string, string>;
  submitting: boolean;
  handleSubmit: (isEdit: boolean) => void;
  resetForm: () => void;
  closeModal: () => void;
}

const ProductForm = ({
  isEdit = false,
  formData,
  setFormData,
  imagePreview,
  handleImageUpload,
  removeImage,
  errors,
  submitting,
  handleSubmit,
  resetForm,
  closeModal,
}: ProductFormProps) => (
  <div className="space-y-6">
    {/* Product Image */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Product Image
      </label>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Product"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="product-image"
          />
          <label
            htmlFor="product-image"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Upload Image
          </label>
          {imagePreview && (
            <button
              type="button"
              onClick={removeImage}
              className="text-red-500 hover:text-red-700 text-sm ml-2"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Basic Information */}
    <div className="grid md:grid-cols-2 gap-4">
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(value) => setFormData({ ...formData, name: value })}
        error={errors.name}
        required
        icon={Package}
        className="text-gray-600"
      />

      <Input
        label="Price ($)"
        type="number"
        step="0.01"
        min="0"
        value={formData.price}
        onChange={(value) => setFormData({ ...formData, price: value })}
        error={errors.price}
        required
        icon={DollarSign}
        className="text-gray-600"
      />

      <Select
        label="Category"
        value={formData.category}
        onChange={(value) => setFormData({ ...formData, category: value })}
        error={errors.category}
        options={CATEGORIES}
        placeholder="Select category"
        className="text-gray-600"
      />

      <Select
        label="Spicy Level"
        value={formData.spicyLevel}
        onChange={(value) => setFormData({ ...formData, spicyLevel: value })}
        options={SPICY_LEVELS}
        className="text-gray-600"
      />

      <Input
        label="Preparation Time (minutes)"
        type="number"
        min="1"
        value={formData.preparationTime}
        onChange={(value) =>
          setFormData({ ...formData, preparationTime: value })
        }
        icon={Clock}
        className="text-gray-600"
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) =>
            setFormData({ ...formData, isAvailable: e.target.checked })
          }
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
          Available for order
        </label>
      </div>
    </div>

    {/* Description */}
    <Textarea
      label="Description"
      value={formData.description}
      onChange={(value) => setFormData({ ...formData, description: value })}
      error={errors.description}
      required
      rows={3}
      placeholder="Describe your product..."
      className="text-gray-600"
    />

    {/* Ingredients and Allergens */}
    <div className="grid md:grid-cols-2 gap-4">
      <Textarea
        label="Ingredients (comma-separated)"
        value={formData.ingredients}
        onChange={(value) => setFormData({ ...formData, ingredients: value })}
        rows={3}
        placeholder="e.g., Tomato, Cheese, Basil"
        className="text-gray-600"
      />

      <Textarea
        label="Allergens (comma-separated)"
        value={formData.allergens}
        onChange={(value) => setFormData({ ...formData, allergens: value })}
        rows={3}
        placeholder="e.g., Nuts, Dairy, Gluten"
        className="text-gray-600"
      />
    </div>

    {/* Actions */}
    <div className="flex justify-end gap-4">
      <Button
        onClick={() => {
          resetForm();
          closeModal();
        }}
        variant="secondary"
      >
        Cancel
      </Button>
      <Button onClick={() => handleSubmit(isEdit)} loading={submitting}>
        {isEdit ? "Update Product" : "Create Product"}
      </Button>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    preparationTime: "15",
    spicyLevel: "0",
    ingredients: "",
    allergens: "",
    image: "",
    isAvailable: true,
  });

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, searchTerm, selectedCategory, selectedStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedStatus) params.append("status", selectedStatus);

      const response = await fetch(`/api/products?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const token = localStorage.getItem("token");
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("folder", "products");

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (response.ok) {
          const data = await response.json();
          setImagePreview(data.url);
          setFormData({ ...formData, image: data.url });
        } else {
          alert("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("An error occurred while uploading your image");
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isEdit = false) => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = isEdit
        ? `/api/products/${selectedProduct?._id}`
        : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          preparationTime: parseInt(formData.preparationTime),
          spicyLevel: parseInt(formData.spicyLevel),
          ingredients: formData.ingredients
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i),
          allergens: formData.allergens
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a),
        }),
      });

      if (response.ok) {
        alert(
          isEdit
            ? "Product updated successfully!"
            : "Product created successfully!",
        );

        resetForm();
        setShowCreateModal(false);
        setShowEditModal(false);
        await fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("An error occurred while saving the product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Product deleted successfully!");
        setShowDeleteModal(false);
        setSelectedProduct(null);
        await fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      preparationTime: product.preparationTime.toString(),
      spicyLevel: product.spicyLevel.toString(),
      ingredients: product.ingredients.join(", "),
      allergens: product.allergens.join(", "),
      image: product.image,
      isAvailable: product.isAvailable,
    });
    setImagePreview(product.image);
    setErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      preparationTime: "15",
      spicyLevel: "0",
      ingredients: "",
      allergens: "",
      image: "",
      isAvailable: true,
    });
    setImagePreview(null);
    setErrors({});
    setSelectedProduct(null);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: "" });
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Products
                </h1>
                <p className="text-gray-600">
                  Create and manage your restaurant products
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Create Product
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory || selectedStatus
                ? "No products match your filters. Try adjusting your search criteria."
                : "Start by creating your first product."}
            </p>
            {!searchTerm && !selectedCategory && !selectedStatus && (
              <Button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Create Your First Product
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isAvailable ? "Available" : "Out of Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {CATEGORIES.find((c) => c.value === product.category)
                          ?.label || product.category}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Product Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Product"
        size="lg"
      >
        <ProductForm
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
          errors={errors}
          submitting={submitting}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          closeModal={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Product"
        size="lg"
      >
        <ProductForm
          isEdit
          formData={formData}
          setFormData={setFormData}
          imagePreview={imagePreview}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
          errors={errors}
          submitting={submitting}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          closeModal={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        loading={submitting}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    size: '',
    condition: '',
    pointsValue: '',
    brand: '',
    color: '',
    material: '',
    tags: ''
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other'];
  const types = ['casual', 'formal', 'sportswear', 'vintage', 'designer', 'other'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Other'];
  const conditions = ['new', 'like-new', 'good', 'fair', 'poor'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image type`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return false;
    }
    if (!formData.type) {
      toast.error('Type is required');
      return false;
    }
    if (!formData.size) {
      toast.error('Size is required');
      return false;
    }
    if (!formData.condition) {
      toast.error('Condition is required');
      return false;
    }
    if (!formData.pointsValue || formData.pointsValue < 10 || formData.pointsValue > 1000) {
      toast.error('Points value must be between 10 and 1000');
      return false;
    }
    if (imageFiles.length === 0) {
      toast.error('At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add images
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      await axios.post('/api/items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Item added successfully! It will be reviewed by our team.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(error.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Item
          </h1>
          <p className="text-gray-600">
            Share your clothing with the community
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Images Upload */}
              <div className="form-group">
                <label className="form-label">
                  Images (up to 5)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <FaUpload className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      Click to upload images or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB each
                    </p>
                  </label>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g., Vintage Denim Jacket"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  className="form-textarea"
                  placeholder="Describe your item in detail..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    className="form-select"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    {types.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Size and Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="size" className="form-label">
                    Size *
                  </label>
                  <select
                    id="size"
                    name="size"
                    required
                    className="form-select"
                    value={formData.size}
                    onChange={handleChange}
                  >
                    <option value="">Select Size</option>
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="condition" className="form-label">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    required
                    className="form-select"
                    value={formData.condition}
                    onChange={handleChange}
                  >
                    <option value="">Select Condition</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Points Value */}
              <div className="form-group">
                <label htmlFor="pointsValue" className="form-label">
                  Points Value (10-1000) *
                </label>
                <input
                  id="pointsValue"
                  name="pointsValue"
                  type="number"
                  min="10"
                  max="1000"
                  required
                  className="form-input"
                  placeholder="e.g., 150"
                  value={formData.pointsValue}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Set the point value for your item. Higher quality items typically have higher values.
                </p>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label htmlFor="brand" className="form-label">
                    Brand
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Nike, Zara"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="color" className="form-label">
                    Color
                  </label>
                  <input
                    id="color"
                    name="color"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Blue, Black"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="material" className="form-label">
                    Material
                  </label>
                  <input
                    id="material"
                    name="material"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Cotton, Denim"
                    value={formData.material}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  Tags
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  className="form-input"
                  placeholder="e.g., vintage, summer, casual (comma separated)"
                  value={formData.tags}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add tags to help others find your item
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner mr-2"></div>
                      Adding Item...
                    </div>
                  ) : (
                    'Add Item'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItem; 
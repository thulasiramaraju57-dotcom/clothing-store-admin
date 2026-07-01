import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Boys');
  const [basePrice, setBasePrice] = useState('');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Variants State
  const [variants, setVariants] = useState([]);
  
  // Images State (Files)
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', sku: '', stock_count: 0 }]);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create Product
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          name,
          description,
          category,
          base_price: parseFloat(basePrice),
          status,
          is_featured: isFeatured,
          slug
        })
        .select()
        .single();

      if (productError) throw productError;
      const productId = productData.id;

      // 2. Upload Images
      const uploadedImages = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedImages.push({
          product_id: productId,
          url: publicUrlData.publicUrl,
          is_primary: i === 0,
          display_order: i
        });
      }

      if (uploadedImages.length > 0) {
        const { error: imageDbError } = await supabase
          .from('product_images')
          .insert(uploadedImages);
        if (imageDbError) throw imageDbError;
      }

      // 3. Create Variants
      if (variants.length > 0) {
        const variantsToInsert = variants.map(v => ({
          ...v,
          product_id: productId,
          stock_count: parseInt(v.stock_count)
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);
        
        if (variantError) throw variantError;
      }

      // Success!
      navigate('/products');
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Add New Product</h1>
      </div>

      {error && <div className="error-state">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Left Column: Basic Details */}
          <div className="admin-card">
            <h3>Basic Details</h3>
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Newborn">Newborn</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div className="form-group">
                <label>Base Price (₹)</label>
                <input type="number" step="0.01" value={basePrice} onChange={e => setBasePrice(e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={isFeatured} 
                  onChange={e => setIsFeatured(e.target.checked)} 
                  style={{ width: 'auto', marginRight: '8px' }}
                />
                <label htmlFor="featured" style={{ marginBottom: 0 }}>Featured on Homepage</label>
              </div>
            </div>
          </div>

          {/* Right Column: Images & Variants */}
          <div className="form-col-right">
            <div className="admin-card">
              <h3>Images</h3>
              <div className="image-upload-area">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} id="img-upload" style={{ display: 'none' }} />
                <label htmlFor="img-upload" className="upload-btn">
                  <Upload size={24} />
                  <span>Click to upload images</span>
                </label>
              </div>
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index}`} />
                    <button type="button" className="remove-img-btn" onClick={() => removeImage(index)}>
                      <X size={14} />
                    </button>
                    {index === 0 && <span className="primary-badge">Primary</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Variants (Sizes/Colors)</h3>
                <button type="button" onClick={addVariant} className="btn btn-outline btn-sm">
                  <Plus size={16} /> Add Variant
                </button>
              </div>
              
              <div className="variants-list">
                {variants.length === 0 ? (
                  <p className="text-muted text-sm">No variants added. Product will be sold as a single item.</p>
                ) : (
                  variants.map((variant, index) => (
                    <div key={index} className="variant-row">
                      <input 
                        type="text" 
                        placeholder="Size (e.g. 3-6M)" 
                        value={variant.size} 
                        onChange={(e) => updateVariant(index, 'size', e.target.value)} 
                        required 
                      />
                      <input 
                        type="text" 
                        placeholder="Color" 
                        value={variant.color} 
                        onChange={(e) => updateVariant(index, 'color', e.target.value)} 
                        required 
                      />
                      <input 
                        type="text" 
                        placeholder="SKU" 
                        value={variant.sku} 
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)} 
                        required 
                      />
                      <input 
                        type="number" 
                        placeholder="Stock" 
                        value={variant.stock_count} 
                        onChange={(e) => updateVariant(index, 'stock_count', e.target.value)} 
                        required 
                      />
                      <button type="button" onClick={() => removeVariant(index)} className="btn-icon danger">
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => navigate('/products')} className="btn btn-outline" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

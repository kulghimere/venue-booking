import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import MapPicker from '../components/MapPicker';
import styles from './AddVenuePage.module.css';

const CATEGORIES = ['wedding','conference','sports','exhibition','outdoor','social','corporate','concert'];
const AMENITIES = ['WiFi','Parking','Catering Kitchen','AV Equipment','Climate Control','Projectors','Sound System','Bar','Dance Floor','Outdoor Area','Changing Rooms','Security','Loading Bay'];

export default function AddVenuePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef();
  const [form, setForm] = useState({
    name:'', description:'', category:'', capacity:'', pricePerHour:'',
    address:'', city:'', country:'UK', imageUrl:'',
    lat:'', lng:'',
    amenities:[], rules:[''], cancellationPolicy:'moderate'
  });

  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  const handleMapSelect = ({ lat, lng, address, city, country }) => {
    setForm(f => ({
      ...f,
      lat: lat.toString(),
      lng: lng.toString(),
      address: address || f.address,
      city: city || f.city,
      country: country || f.country,
    }));
  };
  const toggleAmenity = (a) => setForm(f => ({...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x=>x!==a) : [...f.amenities,a]}));
  const setRule = (i,v) => { const r = [...form.rules]; r[i]=v; setForm(f=>({...f,rules:r})); };
  const addRule = () => setForm(f=>({...f,rules:[...f.rules,'']}));
  const removeRule = (i) => setForm(f=>({...f,rules:f.rules.filter((_,j)=>j!==i)}));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      set('imageUrl', res.data.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
      setImagePreview('');
    } finally { setUploading(false); }
  };

  const handleUrlChange = (e) => {
    set('imageUrl', e.target.value);
    setImagePreview(e.target.value);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImage = () => {
    set('imageUrl', '');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name, description: form.description, category: form.category,
        capacity: parseInt(form.capacity), pricePerHour: parseFloat(form.pricePerHour),
        location: {
          address: form.address, city: form.city, country: form.country,
          ...(form.lat && form.lng ? { coordinates: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) } } : {})
        },
        amenities: form.amenities,
        images: form.imageUrl ? [form.imageUrl] : [],
        rules: form.rules.filter(r=>r.trim()),
        cancellationPolicy: form.cancellationPolicy
      };
      const res = await api.post('/venues', payload);
      toast.success('Venue listed successfully!');
      navigate(`/venues/${res.data.venue._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create venue');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className="container">
          <button onClick={() => navigate(-1)} className={styles.back}>← Back</button>
          <h1>List Your Venue</h1>
          <p>Add your venue to the VenueBook platform</p>
        </div>
      </div>
      <div className="container">
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <h2>Basic Information</h2>
            <div className={styles.grid2}>
              <div className={styles.fieldGroup}><label>Venue Name *</label><input required placeholder="e.g. The Grand Pavilion" value={form.name} onChange={e=>set('name',e.target.value)} /></div>
              <div className={styles.fieldGroup}><label>Category *</label><select required value={form.category} onChange={e=>set('category',e.target.value)}><option value="">Select…</option>{CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
              <div className={styles.fieldGroup}><label>Capacity *</label><input type="number" required min={1} placeholder="Max guests" value={form.capacity} onChange={e=>set('capacity',e.target.value)} /></div>
              <div className={styles.fieldGroup}><label>Price per Hour (£) *</label><input type="number" required min={0} step="0.01" placeholder="e.g. 150" value={form.pricePerHour} onChange={e=>set('pricePerHour',e.target.value)} /></div>
            </div>
            <div className={styles.fieldGroup}><label>Description *</label><textarea required rows={4} placeholder="Describe your venue — features, atmosphere, ideal events…" value={form.description} onChange={e=>set('description',e.target.value)} /></div>

            {/* Image picker */}
            <div className={styles.fieldGroup}>
              <label>Venue Image (optional)</label>
              <div className={styles.imagePicker}>
                <div className={styles.imageInputRow}>
                  <button type="button" className={styles.uploadFileBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Uploading…' : '📁 Upload from computer'}
                  </button>
                  <span className={styles.imageOr}>or</span>
                  <input
                    type="text"
                    className={styles.imageUrlInput}
                    placeholder="Paste image URL (https://…)"
                    value={form.imageUrl}
                    onChange={handleUrlChange}
                  />
                  <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
                </div>
                {imagePreview && (
                  <div className={styles.previewWrap}>
                    <img src={imagePreview} alt="Preview" className={styles.imagePreview} onError={() => setImagePreview('')} />
                    <button type="button" className={styles.clearImg} onClick={clearImage} title="Remove image">✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Location</h2>
            <div className={styles.grid3}>
              <div className={styles.fieldGroup} style={{gridColumn:'span 3'}}><label>Address *</label><input required placeholder="Street address" value={form.address} onChange={e=>set('address',e.target.value)} /></div>
              <div className={styles.fieldGroup}><label>City *</label><input required placeholder="e.g. London" value={form.city} onChange={e=>set('city',e.target.value)} /></div>
              <div className={styles.fieldGroup}><label>Country *</label><input required placeholder="e.g. UK" value={form.country} onChange={e=>set('country',e.target.value)} /></div>
            </div>
            <label style={{display:'block',fontSize:'0.78rem',fontWeight:600,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:'1.25rem',marginBottom:'0.25rem'}}>
              Pin on Map <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,color:'var(--text-muted)'}}>— click to auto-fill address fields</span>
            </label>
            <MapPicker onLocationSelect={handleMapSelect} />
          </div>

          <div className={styles.section}>
            <h2>Amenities</h2>
            <div className={styles.amenitiesGrid}>
              {AMENITIES.map(a => (
                <label key={a} className={`${styles.amenityToggle} ${form.amenities.includes(a)?styles.amenityOn:''}`}>
                  <input type="checkbox" checked={form.amenities.includes(a)} onChange={()=>toggleAmenity(a)} /> {a}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Rules & Policies</h2>
            <div className={styles.fieldGroup} style={{marginBottom:'1.25rem'}}>
              <label>Cancellation Policy</label>
              <select value={form.cancellationPolicy} onChange={e=>set('cancellationPolicy',e.target.value)}>
                <option value="flexible">Flexible — Full refund 24hrs before</option>
                <option value="moderate">Moderate — Full refund 5 days before</option>
                <option value="strict">Strict — 50% refund 7 days before</option>
              </select>
            </div>
            <label className={styles.rulesLabel}>Venue Rules</label>
            {form.rules.map((r,i) => (
              <div key={i} className={styles.ruleRow}>
                <input placeholder={`Rule ${i+1}…`} value={r} onChange={e=>setRule(i,e.target.value)} />
                {form.rules.length>1 && <button type="button" onClick={()=>removeRule(i)} className={styles.removeRule}>✕</button>}
              </div>
            ))}
            <button type="button" onClick={addRule} className={styles.addRuleBtn}>+ Add rule</button>
          </div>

          <div className={styles.submitArea}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>{loading?'Publishing…':'Publish Venue'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

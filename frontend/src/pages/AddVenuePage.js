import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './AddVenuePage.module.css';

const CATEGORIES = ['wedding','conference','sports','exhibition','outdoor','social','corporate','concert'];
const AMENITIES = ['WiFi','Parking','Catering Kitchen','AV Equipment','Climate Control','Projectors','Sound System','Bar','Dance Floor','Outdoor Area','Changing Rooms','Security','Loading Bay'];

export default function AddVenuePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:'', description:'', category:'', capacity:'', pricePerHour:'',
    address:'', city:'', country:'UK', imageUrl:'',
    amenities:[], rules:[''], cancellationPolicy:'moderate'
  });

  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const toggleAmenity = (a) => setForm(f => ({...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x=>x!==a) : [...f.amenities,a]}));
  const setRule = (i,v) => { const r = [...form.rules]; r[i]=v; setForm(f=>({...f,rules:r})); };
  const addRule = () => setForm(f=>({...f,rules:[...f.rules,'']}));
  const removeRule = (i) => setForm(f=>({...f,rules:f.rules.filter((_,j)=>j!==i)}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name, description: form.description, category: form.category,
        capacity: parseInt(form.capacity), pricePerHour: parseFloat(form.pricePerHour),
        location: { address: form.address, city: form.city, country: form.country },
        amenities: form.amenities,
        images: form.imageUrl ? [form.imageUrl] : [],
        rules: form.rules.filter(r=>r.trim()),
        cancellationPolicy: form.cancellationPolicy
      };
      const res = await api.post('/venues', payload);
      toast.success('Venue listed successfully! 🎉');
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
            <div className={styles.fieldGroup}><label>Image URL (optional)</label><input type="url" placeholder="https://…" value={form.imageUrl} onChange={e=>set('imageUrl',e.target.value)} /></div>
          </div>

          <div className={styles.section}>
            <h2>Location</h2>
            <div className={styles.grid3}>
              <div className={styles.fieldGroup} style={{gridColumn:'span 3'}}><label>Address *</label><input required placeholder="Street address" value={form.address} onChange={e=>set('address',e.target.value)} /></div>
              <div className={styles.fieldGroup}><label>City *</label><input required placeholder="e.g. London" value={form.city} onChange={e=>set('city',e.target.value)} /></div>
              <div className={styles.fieldGroup}><label>Country *</label><input required placeholder="e.g. UK" value={form.country} onChange={e=>set('country',e.target.value)} /></div>
            </div>
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

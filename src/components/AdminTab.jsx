import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMembers, createMember, deleteMember } from '../services/members';
import { createLocation, fetchLocations, deleteLocation } from '../services/locations';
import {
  Shield, UserPlus, MapPin, Trash2, Plus, X, User,
  Building, FileText, Mail, Key, ChevronDown, Users, AlertCircle
} from 'lucide-react';

// ─────────────────────────────────────────────
// Shared form input style
// ─────────────────────────────────────────────
const inputCls =
  'block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500';

const labelCls = 'block text-[10px] uppercase font-extrabold text-gray-500 tracking-wider mb-1';

// ─────────────────────────────────────────────
// Role badge helper
// ─────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const cls =
    role === 'admin'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  return (
    <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${cls}`}>
      {role}
    </span>
  );
};

// ─────────────────────────────────────────────
// Member section
// ─────────────────────────────────────────────
const MembersSection = ({ currentUserId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [password, setPassword] = useState('');

  const load = async () => {
    try {
      const data = await fetchMembers();
      setMembers(data);
    } catch (err) {
      setError('Failed to load members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName(''); setEmail(''); setRole('staff'); setPassword('');
    setError(''); setSuccess('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      await createMember({ full_name: name, email, role, password });
      setSuccess(`${name} has been added as ${role}.`);
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, memberName) => {
    if (id === currentUserId) { setError("You can't remove yourself."); return; }
    if (!window.confirm(`Remove ${memberName}? This cannot be undone.`)) return;
    try {
      await deleteMember(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="bg-lime-50 rounded-2xl border border-lime-200 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Team Members
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Add or remove campus staff accounts.</p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); setError(''); setSuccess(''); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          {showForm ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-xs font-medium">
          ✓ {success}
        </div>
      )}

      {/* Add member form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white border border-lime-200 rounded-xl p-4 space-y-3"
        >
          <p className="text-xs font-bold text-gray-700 mb-1">New member details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@campus.edu"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-60"
            >
              {saving ? 'Adding…' : 'Create Member'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-2 border border-lime-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-lime-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 rounded-full border-t-2 border-b-2 border-emerald-500" />
        </div>
      ) : (
        <div className="divide-y divide-lime-100">
          {members.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No members found.</p>
          )}
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                  {m.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{m.full_name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <RoleBadge role={m.role} />
                {m.id !== currentUserId && (
                  <button
                    onClick={() => handleDelete(m.id, m.full_name)}
                    title="Remove member"
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// Locations section
// ─────────────────────────────────────────────
const LocationsSection = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [locName, setLocName] = useState('');
  const [locBuilding, setLocBuilding] = useState('');
  const [locDesc, setLocDesc] = useState('');

  const load = async () => {
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (err) {
      setError('Failed to load locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setLocName(''); setLocBuilding(''); setLocDesc(''); setError(''); setSuccess(''); };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      await createLocation({ name: locName, building: locBuilding, description: locDesc });
      setSuccess(`"${locName}" has been added.`);
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete location "${name}"? All its logs and alerts will also be removed.`)) return;
    try {
      await deleteLocation(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusColors = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    attention: 'bg-amber-100 text-amber-800 border-amber-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <section className="bg-lime-50 rounded-2xl border border-lime-200 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Monitored Locations
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Add or remove waste monitoring stations.</p>
        </div>
        <button
          onClick={() => { setShowForm(f => !f); setError(''); setSuccess(''); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Location'}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-xs font-medium">
          ✓ {success}
        </div>
      )}

      {/* Add location form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white border border-lime-200 rounded-xl p-4 space-y-3"
        >
          <p className="text-xs font-bold text-gray-700 mb-1">New location details</p>
          <div>
            <label className={labelCls}>Location Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                required
                type="text"
                value={locName}
                onChange={e => setLocName(e.target.value)}
                placeholder="e.g. Main Canteen Hall"
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Building / Zone</label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                required
                type="text"
                value={locBuilding}
                onChange={e => setLocBuilding(e.target.value)}
                placeholder="e.g. Zone A – Student Plaza"
                className={`${inputCls} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description (optional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <textarea
                rows="2"
                value={locDesc}
                onChange={e => setLocDesc(e.target.value)}
                placeholder="Context about this waste station…"
                className={`${inputCls} pl-9 resize-none`}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-60"
            >
              {saving ? 'Adding…' : 'Create Location'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-4 py-2 border border-lime-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-lime-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Locations list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 rounded-full border-t-2 border-b-2 border-emerald-500" />
        </div>
      ) : (
        <div className="divide-y divide-lime-100">
          {locations.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No locations found.</p>
          )}
          {locations.map(loc => (
            <div key={loc.id} className="flex items-center justify-between py-3 gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{loc.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{loc.building}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${statusColors[loc.current_status] || statusColors.normal}`}>
                  {loc.current_status}
                </span>
                <button
                  onClick={() => handleDelete(loc.id, loc.name)}
                  title="Delete location"
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// Main AdminTab
// ─────────────────────────────────────────────
export const AdminTab = () => {
  const { user, isAdmin } = useAuth();

  // Guard: non-admins who somehow reach this tab see a block
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <Shield className="h-12 w-12 text-red-400" />
        <h2 className="text-lg font-bold text-gray-800">Access Denied</h2>
        <p className="text-sm text-gray-500">This page is restricted to administrators.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="sr-only">Admin Panel</h1>

      {/* Page header */}
      <div className="flex items-center gap-3 pb-2 border-b border-lime-200">
        <div className="p-2.5 bg-emerald-100 rounded-xl">
          <Shield className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">Admin Panel</h2>
          <p className="text-xs text-gray-400 font-medium">Manage team members and monitoring stations.</p>
        </div>
      </div>

      {/* Sections */}
      <MembersSection currentUserId={user?.id} />
      <LocationsSection />
    </div>
  );
};

export default AdminTab;


import React, { useEffect, useState } from 'react';
import { fetchLocations, createLocation, updateLocation, deleteLocation, fetchLocationById } from '../services/locations';
import { fetchUpdatesByLocationId, submitUpdate } from '../services/updates';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, X, MapPin, Building, FileText, Calendar, Edit3, Trash2, ClipboardList, CheckCircle2, AlertCircle, AlertTriangle, UploadCloud } from 'lucide-react';

export const LocationsTab = ({ selectedLocId, clearSelectedLocId }) => {
  const { user, isAdmin } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Location Detail State
  const [activeLoc, setActiveLoc] = useState(null);
  const [activeLocLogs, setActiveLocLogs] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State: Add Location
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBuilding, setNewBuilding] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Editing State (inside Details Drawer)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBuilding, setEditBuilding] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Reporting State (inside Details Drawer)
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportStatus, setReportStatus] = useState('normal');
  const [reportObservation, setReportObservation] = useState('');
  const [reportImageUrl, setReportImageUrl] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const loadLocationsList = async () => {
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch campus locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocationsList();
  }, []);

  // Listen to selectedLocId passed from dashboard navigation
  useEffect(() => {
    if (selectedLocId) {
      handleOpenDetails(selectedLocId);
      if (clearSelectedLocId) clearSelectedLocId();
    }
  }, [selectedLocId]);

  const handleOpenDetails = async (locId) => {
    setDetailsLoading(true);
    setIsEditing(false);
    setShowReportForm(false);
    setReportObservation('');
    setReportImageUrl('');
    
    try {
      const loc = await fetchLocationById(locId);
      const logs = await fetchUpdatesByLocationId(locId);
      setActiveLoc(loc);
      setActiveLocLogs(logs);
      
      // Init edit fields
      setEditName(loc.name);
      setEditBuilding(loc.building);
      setEditDescription(loc.description || '');
      setReportStatus(loc.current_status);
    } catch (err) {
      console.error(err);
      alert('Failed to load location details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    if (!newName.trim() || !newBuilding.trim()) {
      setAddError('Location Name and Building/Zone are required.');
      setAddLoading(false);
      return;
    }

    try {
      await createLocation({
        name: newName,
        building: newBuilding,
        description: newDescription,
      });

      setNewName('');
      setNewBuilding('');
      setNewDescription('');
      setIsAddModalOpen(false);
      await loadLocationsList();
    } catch (err) {
      console.error(err);
      setAddError('Failed to create location: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    try {
      const updated = await updateLocation(activeLoc.id, {
        name: editName,
        building: editBuilding,
        description: editDescription
      });
      setActiveLoc(updated);
      setIsEditing(false);
      await loadLocationsList(); // Refresh parent grid
    } catch (err) {
      console.error(err);
      setEditError('Failed to update details: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this monitoring location? This will delete all history and alerts.')) {
      return;
    }

    try {
      await deleteLocation(activeLoc.id);
      setActiveLoc(null);
      await loadLocationsList();
    } catch (err) {
      console.error(err);
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setReportError('Image size should be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportImageUrl(reader.result); // Base64 dataURL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportLoading(true);

    if (!user) {
      setReportError('You must be signed in.');
      setReportLoading(false);
      return;
    }

    try {
      await submitUpdate({
        location_id: activeLoc.id,
        user_id: user.id,
        status: reportStatus,
        observation: reportObservation,
        image_url: reportImageUrl
      });

      setShowReportForm(false);
      setReportObservation('');
      setReportImageUrl('');
      
      // Reload logs and active location details
      await handleOpenDetails(activeLoc.id);
      await loadLocationsList(); // reload parent grid list
    } catch (err) {
      console.error(err);
      setReportError('Failed to log report: ' + err.message);
    } finally {
      setReportLoading(false);
    }
  };

  // Filters
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.building.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || loc.current_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusStyles = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    attention: 'bg-amber-100 text-amber-800 border-amber-200',
    critical: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
  };

  return (
    <div className="space-y-8 relative">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Monitored Locations</h1>
          <p className="text-gray-500 font-medium">Browse and manage campus waste collection areas.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md shadow-green-600/10 hover:shadow-lg transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Location</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search by location name or building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 font-medium transition"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 font-semibold text-gray-700 transition"
          >
            <option value="all">All Statuses</option>
            <option value="normal">Normal</option>
            <option value="attention">Attention</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Grid view */}
      {filteredLocations.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 rounded-2xl text-center">
          <p className="text-gray-400 font-bold text-lg">No Locations Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => (
            <div 
              key={loc.id} 
              onClick={() => handleOpenDetails(loc.id)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${statusStyles[loc.current_status]}`}>
                    {loc.current_status}
                  </span>
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{loc.name}</h3>
                <p className="text-xs font-semibold text-green-700 mb-2">{loc.building}</p>
                <p className="text-gray-500 text-xs line-clamp-2 min-h-[2.5rem]">
                  {loc.description || 'No description provided.'}
                </p>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Checked: {new Date(loc.last_checked).toLocaleDateString()}</span>
                </div>
                <span className="font-bold text-green-600 hover:underline">View History &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS SLIDE-OVER DRAWER */}
      {activeLoc && (
        <div className="fixed inset-0 z-40 overflow-hidden flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-200">
            {/* Close button */}
            <button
              onClick={() => setActiveLoc(null)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {detailsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 pt-16">
                
                {/* 1. Header/Details Block */}
                {!isEditing ? (
                  <div className="space-y-3 pb-6 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${statusStyles[activeLoc.current_status]}`}>
                        Status: {activeLoc.current_status}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Checked: {new Date(activeLoc.last_checked).toLocaleString()}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-gray-900 leading-tight">{activeLoc.name}</h2>
                    <p className="text-xs font-semibold text-green-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" /> {activeLoc.building}
                    </p>
                    <p className="text-gray-500 text-xs mt-2 italic leading-relaxed">
                      {activeLoc.description || 'No description provided.'}
                    </p>

                    <div className="pt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => { setShowReportForm(!showReportForm); setIsEditing(false); }}
                        className="inline-flex items-center space-x-1 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <ClipboardList className="h-4 w-4" />
                        <span>{showReportForm ? 'View Logs' : 'Update Status'}</span>
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => { setIsEditing(true); setShowReportForm(false); }}
                            className="inline-flex items-center space-x-1 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold transition"
                          >
                            <Edit3 className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={handleDelete}
                            className="inline-flex items-center space-x-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  // Admin Edit Details Panel
                  <form onSubmit={handleEditSubmit} className="space-y-4 pb-6 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900">Edit Location Details</h3>
                    {editError && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{editError}</div>}
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-gray-500 mb-1">Building / Zone</label>
                      <input
                        type="text"
                        required
                        value={editBuilding}
                        onChange={(e) => setEditBuilding(e.target.value)}
                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-gray-500 mb-1">Description</label>
                      <textarea
                        rows="2"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs resize-none"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button type="submit" disabled={editLoading} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold">Save</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border rounded-lg text-xs">Cancel</button>
                    </div>
                  </form>
                )}

                {/* 2. REPORT STATUS FORM (Swap-in view inside drawer) */}
                {showReportForm ? (
                  <form onSubmit={handleReportSubmit} className="space-y-4">
                    <div className="pb-2">
                      <h3 className="text-sm font-bold text-gray-900">Submit waste status report</h3>
                      <p className="text-[10px] text-gray-400">Log new waste conditions for this site.</p>
                    </div>

                    {reportError && <div className="text-xs text-red-650 bg-red-50 p-2.5 rounded-lg">{reportError}</div>}

                    {/* Radio Selectors */}
                    <div className="grid grid-cols-3 gap-2">
                      <label className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                        reportStatus === 'normal' ? 'border-green-500 bg-green-50/20' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="rstatus" value="normal" checked={reportStatus === 'normal'} onChange={(e) => setReportStatus(e.target.value)} className="sr-only" />
                        <CheckCircle2 className="h-5 w-5 mb-1 text-green-600" />
                        <span className="text-xs font-bold">Normal</span>
                      </label>

                      <label className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                        reportStatus === 'attention' ? 'border-amber-500 bg-amber-50/20' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="rstatus" value="attention" checked={reportStatus === 'attention'} onChange={(e) => setReportStatus(e.target.value)} className="sr-only" />
                        <AlertCircle className="h-5 w-5 mb-1 text-amber-600" />
                        <span className="text-xs font-bold">Attention</span>
                      </label>

                      <label className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                        reportStatus === 'critical' ? 'border-red-500 bg-red-50/20' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="rstatus" value="critical" checked={reportStatus === 'critical'} onChange={(e) => setReportStatus(e.target.value)} className="sr-only" />
                        <AlertTriangle className="h-5 w-5 mb-1 text-red-600" />
                        <span className="text-xs font-bold">Critical</span>
                      </label>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-gray-500 mb-1">Observations</label>
                      <textarea
                        required
                        rows="3"
                        value={reportObservation}
                        onChange={(e) => setReportObservation(e.target.value)}
                        placeholder="What is the current status of waste bins?"
                        className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>

                    {/* Image selector */}
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-gray-500 mb-1">Photo Upload (Optional)</label>
                      <div className="border border-dashed border-gray-250 p-4 rounded-xl flex flex-col items-center hover:bg-gray-50 transition">
                        {reportImageUrl ? (
                          <div className="flex flex-col items-center">
                            <img src={reportImageUrl} alt="Upload preview" className="h-20 w-auto rounded border" />
                            <button type="button" onClick={() => setReportImageUrl('')} className="text-[10px] text-red-500 font-bold mt-1 hover:underline">Remove</button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center">
                            <UploadCloud className="h-5 w-5 text-green-600 mb-1" />
                            <span className="text-[10px] font-bold text-gray-600">Choose photo</span>
                            <input type="file" accept="image/*" onChange={handleImageFileChange} className="sr-only" />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button type="submit" disabled={reportLoading} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition">
                        {reportLoading ? 'Submitting...' : 'Submit Report'}
                      </button>
                      <button type="button" onClick={() => setShowReportForm(false)} className="px-4 py-2 border rounded-xl text-xs">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // 3. Status History Timeline Log
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center">
                      <ClipboardList className="h-4.5 w-4.5 mr-1.5 text-green-600" />
                      Status Logs History ({activeLocLogs.length})
                    </h3>

                    {activeLocLogs.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No reports logged yet.</p>
                    ) : (
                      <div className="border-l border-gray-100 ml-2 pl-4 space-y-5">
                        {activeLocLogs.map((log) => {
                          let dotColor = 'bg-green-500';
                          let badge = 'text-green-700 bg-green-50';
                          if (log.status === 'attention') {
                            dotColor = 'bg-amber-500';
                            badge = 'text-amber-700 bg-amber-50';
                          } else if (log.status === 'critical') {
                            dotColor = 'bg-red-500 animate-pulse';
                            badge = 'text-red-700 bg-red-50';
                          }

                          return (
                            <div key={log.id} className="relative">
                              <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white ${dotColor}`} />
                              <div className="text-xs space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-[8px] font-extrabold uppercase px-1 rounded border border-current ${badge}`}>
                                    {log.status}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {new Date(log.created_at).toLocaleDateString()} &bull; {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-gray-500 text-[10px]">
                                  Reported by: <span className="font-bold text-gray-700">{log.user_name}</span>
                                </p>
                                {log.observation && (
                                  <p className="text-gray-600 text-xs italic bg-slate-50 border p-2 rounded-lg leading-relaxed max-w-sm">
                                    "{log.observation}"
                                  </p>
                                )}
                                {log.image_url && (
                                  <img 
                                    src={log.image_url} 
                                    alt="Observation log" 
                                    className="mt-1 max-h-32 rounded border shadow-sm"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Station</h2>
              <p className="text-xs text-gray-400 font-medium">Add a campus area for waste monitoring.</p>
            </div>

            {addError && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs mb-4">{addError}</div>}

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-extrabold text-gray-500 tracking-wider mb-1">Location Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><MapPin className="h-4.5 w-4.5" /></span>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Main Canteen Hall"
                    className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-gray-500 tracking-wider mb-1">Building / Zone</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Building className="h-4.5 w-4.5" /></span>
                  <input
                    type="text"
                    required
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    placeholder="e.g. Zone A - Student Plaza"
                    className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-gray-500 tracking-wider mb-1">Description (Optional)</label>
                <div className="relative">
                  <span className="absolute top-2.5 left-3 text-gray-400"><FileText className="h-4.5 w-4.5" /></span>
                  <textarea
                    rows="2"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Context about bin location..."
                    className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button type="submit" disabled={addLoading} className="flex-1 py-2 bg-green-600 text-white font-bold rounded-xl text-xs transition">
                  {addLoading ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default LocationsTab;


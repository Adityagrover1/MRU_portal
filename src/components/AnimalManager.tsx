import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AnimalType {
  id: string;
  name: string;
}

interface Animal {
  id: string;
  animal_type_id: string;
  tag_id: string;
  name: string;
  created_at: string;
  animal_types: { name: string };
}

const EMPTY_FORM = { animal_type_id: '', tag_id: '', name: '' };

export function AnimalManager() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetchAnimalTypes();
    fetchAnimals();
  }, [user]);

  const fetchAnimalTypes = async () => {
    const { data, error } = await supabase.from('animal_types').select('id, name').order('name');
    if (error) { setFetchError('Failed to load animal types. Please refresh.'); return; }
    if (data) setAnimalTypes(data);
  };

  const fetchAnimals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('animals')
      .select('id, animal_type_id, tag_id, name, created_at, animal_types(name)')
      .eq('user_id', user.id)
      .order('tag_id');
    if (error) { setFetchError('Failed to load animals. Please refresh.'); return; }
    if (data) setAnimals(data as Animal[]);
  };

  const handleEdit = (animal: Animal) => {
    setEditingId(animal.id);
    setFormData({ animal_type_id: animal.animal_type_id, tag_id: animal.tag_id, name: animal.name });
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      if (editingId) {
        const { error: err } = await supabase
          .from('animals')
          .update({
            animal_type_id: formData.animal_type_id,
            tag_id: formData.tag_id.trim(),
            name: formData.name.trim(),
          })
          .eq('id', editingId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('animals').insert([
          {
            user_id: user.id,
            animal_type_id: formData.animal_type_id,
            tag_id: formData.tag_id.trim(),
            name: formData.name.trim(),
          },
        ]);
        if (err) throw err;
      }

      handleCancel();
      fetchAnimals();
    } catch (err: unknown) {
      console.error('Animal save error:', err);
      if (err && typeof err === 'object' && 'code' in err) {
        const dbErr = err as { code: string; message?: string };
        if (dbErr.code === '23505') {
          setError('An animal with this Tag ID already exists.');
        } else if (dbErr.code === '42P01') {
          setError('Database table not found. Please apply the latest migration in your Supabase dashboard.');
        } else {
          setError(`Error ${dbErr.code}: ${dbErr.message || 'Failed to save animal.'}`);
        }
      } else {
        setError('Failed to save animal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, tagId: string) => {
    if (!window.confirm(`Delete animal "${tagId}"? Any drug logs linked to this animal will be unlinked.`)) return;
    const { error: err } = await supabase.from('animals').delete().eq('id', id);
    if (err) {
      alert('Failed to delete animal. Please try again.');
    }
    fetchAnimals();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Animal IDs</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData(EMPTY_FORM); setError(''); }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Animal
          </button>
        )}
      </div>

      {fetchError && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{fetchError}</p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-md space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {editingId ? 'Edit Animal' : 'Register New Animal'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tag / ID *</label>
              <input
                type="text"
                value={formData.tag_id}
                onChange={(e) => setFormData({ ...formData, tag_id: e.target.value })}
                required
                placeholder="e.g. EAR-001, RFID-245"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name (optional)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bessie"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Animal Type *</label>
              <select
                value={formData.animal_type_id}
                onChange={(e) => setFormData({ ...formData, animal_type_id: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                {animalTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Saving...' : editingId ? 'Update' : 'Register'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {animals.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No animals registered yet. Add individual animals to track them in drug logs.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag / ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 font-mono font-medium text-gray-900">{animal.tag_id}</td>
                  <td className="px-4 py-2 text-gray-600">{animal.name || <span className="text-gray-400 italic">—</span>}</td>
                  <td className="px-4 py-2 text-gray-600">{animal.animal_types.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(animal)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(animal.id, animal.tag_id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

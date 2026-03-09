import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateTimeAwareMRLStatus } from '../lib/mrlCalculator';
import { Save } from 'lucide-react';

interface Drug {
  id: string;
  name: string;
}

interface AnimalType {
  id: string;
  name: string;
}

interface DrugUsageFormProps {
  onLogAdded: () => void;
  editingLog?: DrugUsageLog | null;
  onCancelEdit?: () => void;
}

interface DrugUsageLog {
  id: string;
  drug_id: string;
  animal_type_id: string;
  dose_amount: number;
  dose_unit: string;
  animal_count: number;
  administration_date: string;
  notes: string;
}

export function DrugUsageForm({ onLogAdded, editingLog = null, onCancelEdit }: DrugUsageFormProps) {
  const { user } = useAuth();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    drug_id: '',
    animal_type_id: '',
    dose_amount: '',
    dose_unit: 'mg',
    animal_count: '1',
    administration_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Populate form when editing a log
  useEffect(() => {
    if (editingLog) {
      setFormData({
        drug_id: editingLog.drug_id,
        animal_type_id: editingLog.animal_type_id,
        dose_amount: editingLog.dose_amount.toString(),
        dose_unit: editingLog.dose_unit,
        animal_count: editingLog.animal_count.toString(),
        administration_date: editingLog.administration_date,
        notes: editingLog.notes || '',
      });
    } else {
      // Reset form when not editing
      setFormData({
        drug_id: '',
        animal_type_id: '',
        dose_amount: '',
        dose_unit: 'mg',
        animal_count: '1',
        administration_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [editingLog]);

  const fetchReferenceData = async () => {
    const [drugsResult, animalTypesResult] = await Promise.all([
      supabase.from('drugs').select('id, name').order('name'),
      supabase.from('animal_types').select('id, name').order('name'),
    ]);

    if (drugsResult.data) setDrugs(drugsResult.data);
    if (animalTypesResult.data) setAnimalTypes(animalTypesResult.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);

    try {
      // Find the drug name and animal type name for MRL calculation
      const drugName = drugs.find(d => d.id === formData.drug_id)?.name || '';
      const animalTypeName = animalTypes.find(a => a.id === formData.animal_type_id)?.name || '';

      // Calculate MRL status based on industry standards with time-aware logic
      const mrlResult = calculateTimeAwareMRLStatus(
        drugName,
        animalTypeName,
        parseFloat(formData.dose_amount),
        formData.dose_unit,
        formData.administration_date  // Pass administration date for time-aware calculation
      );

      if (editingLog) {
        // UPDATE mode - editing existing log
        const { error } = await supabase
          .from('drug_usage_logs')
          .update({
            drug_id: formData.drug_id,
            animal_type_id: formData.animal_type_id,
            dose_amount: parseFloat(formData.dose_amount),
            dose_unit: formData.dose_unit,
            animal_count: parseInt(formData.animal_count),
            administration_date: formData.administration_date,
            notes: formData.notes,
            mrl_status: mrlResult.status,
          })
          .eq('id', editingLog.id);

        if (error) throw error;
      } else {
        // INSERT mode - creating new log
        const { error } = await supabase.from('drug_usage_logs').insert([
          {
            user_id: user.id,
            drug_id: formData.drug_id,
            animal_type_id: formData.animal_type_id,
            dose_amount: parseFloat(formData.dose_amount),
            dose_unit: formData.dose_unit,
            animal_count: parseInt(formData.animal_count),
            administration_date: formData.administration_date,
            notes: formData.notes,
            mrl_status: mrlResult.status,
          },
        ]);

        if (error) throw error;
      }

      setSuccess(true);
      setFormData({
        drug_id: '',
        animal_type_id: '',
        dose_amount: '',
        dose_unit: 'mg',
        animal_count: '1',
        administration_date: new Date().toISOString().split('T')[0],
        notes: '',
      });

      onLogAdded();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding log:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {editingLog ? 'Edit Drug Usage' : 'Log Drug Usage'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drug Name
          </label>
          <select
            value={formData.drug_id}
            onChange={(e) => setFormData({ ...formData, drug_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a drug</option>
            {drugs.map((drug) => (
              <option key={drug.id} value={drug.id}>
                {drug.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Animal Type
          </label>
          <select
            value={formData.animal_type_id}
            onChange={(e) => setFormData({ ...formData, animal_type_id: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select animal type</option>
            {animalTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dose Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.dose_amount}
              onChange={(e) => setFormData({ ...formData, dose_amount: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={formData.dose_unit}
              onChange={(e) => setFormData({ ...formData, dose_unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="g">g</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animal Count
            </label>
            <input
              type="number"
              min="1"
              value={formData.animal_count}
              onChange={(e) => setFormData({ ...formData, animal_count: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.administration_date}
              onChange={(e) => setFormData({ ...formData, administration_date: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Add any relevant notes..."
          />
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            Drug usage {editingLog ? 'updated' : 'logged'} successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : editingLog ? 'Update Drug Usage' : 'Log Drug Usage'}
        </button>

        {editingLog && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="w-full bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition-colors font-medium"
          >
            Cancel Edit
          </button>
        )}
      </form>
    </div>
  );
}

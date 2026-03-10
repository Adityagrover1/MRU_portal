import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { calculateTimeAwareMRLStatus, FSSAI_STANDARDS_MRLS } from '../../lib/calculations/mrlCalculator';
import { Save } from 'lucide-react';

interface Drug {
  id: string;
  name: string;
}

interface AnimalType {
  id: string;
  name: string;
}

interface Animal {
  id: string;
  animal_type_id: string;
  tag_id: string;
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
  animal_id: string | null;
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
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [refError, setRefError] = useState('');
  const [unsupportedWarning, setUnsupportedWarning] = useState(false);

  const [formData, setFormData] = useState({
    drug_id: '',
    animal_type_id: '',
    animal_id: '',
    dose_amount: '',
    dose_unit: 'mg',
    animal_count: '1',
    administration_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchReferenceData();
  }, [user]);

  // Populate form when editing a log
  useEffect(() => {
    if (editingLog) {
      setFormData({
        drug_id: editingLog.drug_id,
        animal_type_id: editingLog.animal_type_id,
        animal_id: editingLog.animal_id || '',
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
        animal_id: '',
        dose_amount: '',
        dose_unit: 'mg',
        animal_count: '1',
        administration_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
    setUnsupportedWarning(false);
  }, [editingLog]);

  const fetchReferenceData = async () => {
    if (!user) return;
    const [drugsResult, animalTypesResult, animalsResult] = await Promise.all([
      supabase.from('drugs').select('id, name').order('name'),
      supabase.from('animal_types').select('id, name').order('name'),
      supabase.from('animals').select('id, animal_type_id, tag_id, name').eq('user_id', user.id).order('tag_id'),
    ]);

    if (drugsResult.error || animalTypesResult.error || animalsResult.error) {
      setRefError('Failed to load reference data. Please refresh the page.');
      return;
    }

    if (drugsResult.data) setDrugs(drugsResult.data);
    if (animalTypesResult.data) setAnimalTypes(animalTypesResult.data);
    if (animalsResult.data) setAnimals(animalsResult.data as Animal[]);
  };

  // Animals filtered to those matching the currently selected animal type
  const filteredAnimals = animals.filter(
    (a) => !formData.animal_type_id || a.animal_type_id === formData.animal_type_id
  );

  const isValidDrugAnimalCombination = (drugName: string, animalName: string): boolean => {
    if (!drugName || !animalName) return false;
    const drugData = FSSAI_STANDARDS_MRLS[drugName];
    return drugData !== undefined && drugData.animalTypes[animalName] !== undefined;
  };

  const handleDrugOrAnimalChange = (drugId: string, animalTypeId: string) => {
    const drugName = drugs.find(d => d.id === drugId)?.name || '';
    const animalTypeName = animalTypes.find(a => a.id === animalTypeId)?.name || '';

    if (drugName && animalTypeName) {
      const isValid = isValidDrugAnimalCombination(drugName, animalTypeName);
      setUnsupportedWarning(!isValid);
    } else {
      setUnsupportedWarning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      // Find the drug name and animal type name for MRL calculation
      const drugName = drugs.find(d => d.id === formData.drug_id)?.name || '';
      const animalTypeName = animalTypes.find(a => a.id === formData.animal_type_id)?.name || '';

      // Calculate MRL status based on FSSAI standards with time-aware logic
      const mrlResult = calculateTimeAwareMRLStatus(
        drugName,
        animalTypeName,
        parseFloat(formData.dose_amount),
        formData.dose_unit,
        formData.administration_date,  // Pass administration date for time-aware calculation
        new Date(),
        'FSSAI'  // Use FSSAI standards
      );

      const animalId = formData.animal_id || null;

      if (editingLog) {
        // UPDATE mode - editing existing log
        const { error } = await supabase
          .from('drug_usage_logs')
          .update({
            drug_id: formData.drug_id,
            animal_type_id: formData.animal_type_id,
            animal_id: animalId,
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
            animal_id: animalId,
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
        animal_id: '',
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
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {editingLog ? 'Edit Drug Usage' : 'Log Drug Usage'}
      </h2>

      {refError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {refError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drug Name
          </label>
          <select
            value={formData.drug_id}
            onChange={(e) => {
              const newDrugId = e.target.value;
              setFormData({ ...formData, drug_id: newDrugId });
              handleDrugOrAnimalChange(newDrugId, formData.animal_type_id);
            }}
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
            onChange={(e) => {
              const newAnimalTypeId = e.target.value;
              // Reset individual animal when type changes
              setFormData({ ...formData, animal_type_id: newAnimalTypeId, animal_id: '' });
              handleDrugOrAnimalChange(formData.drug_id, newAnimalTypeId);
            }}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Individual Animal ID <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            value={formData.animal_id}
            onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
            disabled={!formData.animal_type_id}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {formData.animal_type_id
                ? filteredAnimals.length === 0
                  ? 'No animals registered for this type'
                  : 'Select individual animal (optional)'
                : 'Select animal type first'}
            </option>
            {filteredAnimals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.tag_id}{animal.name ? ` — ${animal.name}` : ''}
              </option>
            ))}
          </select>
          {formData.animal_type_id && filteredAnimals.length === 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Register animals in the Animal IDs panel to link individual animals to logs.
            </p>
          )}
        </div>

        {unsupportedWarning && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex gap-2 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Unsupported combination:</strong> This drug-animal type combination is not in the database. Dose will be marked as EXCEEDED for safety. Please verify before use.
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dose Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
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
              step="1"
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
              max={new Date().toISOString().split('T')[0]}
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
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Add any relevant notes..."
          />
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            Drug usage {editingLog ? 'updated' : 'logged'} successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
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

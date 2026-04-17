import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { DrugUsageLog } from '../types/index';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { DrugUsageForm } from '../components/forms/DrugUsageForm';
import { MRLStatusTable } from '../components/tables/MRLStatusTable';
import { UsageChart } from '../components/common/UsageChart';
import { RegulatoryResources } from '../components/common/RegulatoryResources';
import { AnimalManager } from '../components/AnimalManager';
import { Header } from '../components/common/Header';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [logs, setLogs] = useState<DrugUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [editingLog, setEditingLog] = useState<DrugUsageLog | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    warning: 0,
    exceeded: 0,
  });

  const fetchLogs = async () => {
    if (!user) return;

    try {
      const data = await apiRequest<DrugUsageLog[]>('/api/drug-usage-logs');

      setLogs(data);

      const currentStatuses = data.map(log => log.live_mrl?.status || log.mrl_status);

      const total = data.length;
        const safe = currentStatuses.filter(s => s === 'safe').length;
        const warning = currentStatuses.filter(s => s === 'warning').length;
        const exceeded = currentStatuses.filter(s => s === 'exceeded').length;

        setStats({ total, safe, warning, exceeded });
    } catch (error) {
      console.error('Error fetching logs:', error);
      setFetchError('Failed to load drug usage logs. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const handleLogAdded = () => {
    setEditingLog(null);  // Clear edit mode after adding/updating
    fetchLogs();
  };

  const handleEdit = (log: DrugUsageLog) => {
    setEditingLog(log);
    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (logId: string) => {
    if (!window.confirm('Are you sure you want to delete this drug usage log?')) {
      return;
    }

    try {
      await apiRequest(`/api/drug-usage-logs/${logId}`, 'DELETE');

      await fetchLogs();  // Refresh the list
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
  };

  const alertCount = stats.warning + stats.exceeded;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        email={user?.email}
        onSignOut={signOut}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alertCount > 0 && (
          <div className="mb-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">MRL Alerts</h3>
                <p className="mt-1 text-sm text-orange-700">
                  You have {alertCount} drug usage {alertCount === 1 ? 'entry' : 'entries'} that {alertCount === 1 ? 'requires' : 'require'} attention.
                  {stats.exceeded > 0 && ` ${stats.exceeded} exceeded safe limits.`}
                  {stats.warning > 0 && ` ${stats.warning} approaching limits.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Safe</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.safe}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warning</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exceeded</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.exceeded}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnimalManager />
          <div className="grid grid-cols-1 gap-6">
            <DrugUsageForm
              onLogAdded={handleLogAdded}
              editingLog={editingLog}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        </div>

        <div className="mb-8">
          <UsageChart logs={logs} />
        </div>

        {fetchError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">{fetchError}</p>
          </div>
        )}

        <MRLStatusTable
          logs={logs}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <RegulatoryResources />
      </main>
    </div>
  );
}

import { BarChart3 } from 'lucide-react';
import { calculateTimeAwareMRLStatus } from '../lib/mrlCalculator';
import { DrugUsageLog } from '../types';

interface UsageChartProps {
  logs: DrugUsageLog[];
}

export function UsageChart({ logs }: UsageChartProps) {
  const drugCounts = logs.reduce((acc, log) => {
    const drugName = log.drugs.name;
    acc[drugName] = (acc[drugName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(drugCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const statusCounts = logs.reduce(
    (acc, log) => {
      const liveStatus = calculateTimeAwareMRLStatus(
        log.drugs.name,
        log.animal_types.name,
        log.dose_amount,
        log.dose_unit,
        log.administration_date,
        new Date(),
        'FSSAI'
      );
      acc[liveStatus.status] = (acc[liveStatus.status] || 0) + 1;
      return acc;
    },
    { safe: 0, warning: 0, exceeded: 0 } as Record<string, number>
  );

  const totalStatus = statusCounts.safe + statusCounts.warning + statusCounts.exceeded || 1;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">Usage Analytics</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Top Drugs Used</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-500">No data available</p>
          ) : (
            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{item.name}</span>
                    <span className="text-gray-500">{item.count} uses</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">MRL Status Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-700 font-medium">Safe</span>
                <span className="text-gray-500">
                  {((statusCounts.safe / totalStatus) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(statusCounts.safe / totalStatus) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-700 font-medium">Warning</span>
                <span className="text-gray-500">
                  {((statusCounts.warning / totalStatus) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(statusCounts.warning / totalStatus) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-700 font-medium">Exceeded</span>
                <span className="text-gray-500">
                  {((statusCounts.exceeded / totalStatus) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(statusCounts.exceeded / totalStatus) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

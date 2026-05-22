import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DrugUsageLog } from '../../types/index';
import { calculateTimeAwareMRLStatus } from '../../lib/calculations/mrlCalculator';

interface SafeEvent {
  log: DrugUsageLog;
  safeDate: Date;
  isPast: boolean;
}

function getSafeDate(log: DrugUsageLog): Date {
  const result = calculateTimeAwareMRLStatus(
    log.drugs.name,
    log.animal_types.name,
    log.dose_amount,
    log.dose_unit,
    log.administration_date,
    new Date(),
    'FSSAI'
  );
  const d = new Date(log.administration_date);
  d.setDate(d.getDate() + result.withdrawalPeriod);
  return d;
}

const DRUG_COLORS: Record<string, string> = {
  Amoxicillin: 'bg-blue-100 text-blue-700',
  Oxytetracycline: 'bg-purple-100 text-purple-700',
  'Penicillin G': 'bg-pink-100 text-pink-700',
  Sulfadiazine: 'bg-yellow-100 text-yellow-700',
  Chlortetracycline: 'bg-indigo-100 text-indigo-700',
  Gentamicin: 'bg-teal-100 text-teal-700',
  Enrofloxacin: 'bg-cyan-100 text-cyan-700',
  Metronidazole: 'bg-rose-100 text-rose-700',
  Ampicillin: 'bg-sky-100 text-sky-700',
  Streptomycin: 'bg-violet-100 text-violet-700',
  Tetracycline: 'bg-amber-100 text-amber-700',
  Erythromycin: 'bg-lime-100 text-lime-700',
  Neomycin: 'bg-fuchsia-100 text-fuchsia-700',
};

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WithdrawalCalendar({ logs }: { logs: DrugUsageLog[] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const events: SafeEvent[] = logs.map(log => {
    const safeDate = getSafeDate(log);
    return { log, safeDate, isPast: safeDate < today };
  });

  const monthEvents = events.filter(
    e => e.safeDate.getFullYear() === year && e.safeDate.getMonth() === month
  );

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = viewDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Withdrawal Calendar</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium w-40 text-center">{monthLabel}</span>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="ml-2 text-xs px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-600"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-gray-200">
        {DAY_HEADERS.map(d => (
          <div
            key={d}
            className="border-r border-b border-gray-200 bg-gray-50 text-center py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

          const dayEvents = day
            ? monthEvents.filter(e => e.safeDate.getDate() === day)
            : [];

          return (
            <div
              key={i}
              className={`border-r border-b border-gray-200 min-h-[72px] p-1 ${
                !day ? 'bg-gray-50' : ''
              } ${isToday ? 'bg-green-50' : ''}`}
            >
              {day && (
                <>
                  <span
                    className={`text-xs font-medium inline-block w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-0.5 flex flex-col gap-0.5">
                    {dayEvents.map((e, j) => {
                      const label = e.log.animals?.tag_id
                        ? e.log.animals.tag_id
                        : e.log.animal_types.name;
                      const drugShort = e.log.drugs.name.slice(0, 7);
                      const colorClass =
                        DRUG_COLORS[e.log.drugs.name] ?? 'bg-gray-100 text-gray-700';
                      const tooltipText = `${e.log.drugs.name} | ${
                        e.log.animals?.tag_id
                          ? `Tag: ${e.log.animals.tag_id}${e.log.animals.name ? ` (${e.log.animals.name})` : ''}`
                          : `${e.log.animal_types.name} × ${e.log.animal_count}`
                      } | ${e.isPast ? 'Became safe' : 'Becomes safe'} ${e.safeDate.toLocaleDateString('en-IN')}`;

                      return (
                        <div
                          key={j}
                          title={tooltipText}
                          className={`text-[10px] rounded px-1 py-0.5 truncate cursor-default font-medium ${colorClass} ${
                            e.isPast ? 'opacity-60' : ''
                          }`}
                        >
                          {label} · {drugShort}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {monthEvents.length === 0 && (
        <p className="text-xs text-gray-400 text-center mt-3">
          No withdrawal periods ending this month.
        </p>
      )}

      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-green-100 rounded border border-green-300 inline-block" />
          Safe (past)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-orange-100 rounded border border-orange-300 inline-block" />
          Upcoming safe date
        </span>
        <span className="text-gray-400 ml-auto">Hover a chip for details</span>
      </div>
    </div>
  );
}

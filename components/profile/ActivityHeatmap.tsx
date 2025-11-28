import React, { useEffect, useMemo, useState } from 'react';
import { progressService, ActivityResponse } from '@/services/progressService';

type Props = {
  userId: string;
  weeks?: number; // number of weeks to show (GitHub shows 52/53)
};

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDateKey(key: string): string {
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y}`;
}

function clampDate(year: number, monthIndex: number, day: number): Date {
  // monthIndex is 0-based
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const dayClamped = Math.min(day, lastDay);
  return new Date(year, monthIndex, dayClamped);
}

function classForCount(count: number): string {
  if (count <= 0) return 'bg-gray-200';
  if (count === 1) return 'bg-green-100';
  if (count <= 3) return 'bg-green-300';
  if (count <= 6) return 'bg-green-500';
  return 'bg-green-700';
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ActivityHeatmap: React.FC<Props> = ({ userId, weeks = 53 }) => {
  const [data, setData] = useState<ActivityResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await progressService.getUserActivity(userId);
        if (mounted) setData(res);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (userId) run();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>();
    if (data) {
      for (const item of data) {
        const key = item.completedAt; // already a LocalDate string yyyy-MM-dd
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
    return map;
  }, [data]);

  const grid = useMemo(() => {
    const today = new Date();
    const anchorY = today.getFullYear();
    const anchorM = today.getMonth();
    const anchorD = today.getDate();

    // From same day last year → same day next month (clamped to valid dates)
    const rangeStart = clampDate(anchorY - 1, anchorM, anchorD);
    const rangeEnd = clampDate(anchorY, anchorM + 1, anchorD);

    // Start from the previous Sunday before rangeStart
    const startDay = rangeStart.getDay();
    const firstSunday = new Date(rangeStart);
    firstSunday.setDate(rangeStart.getDate() - startDay);

    // Compute number of weeks to cover until rangeEnd
    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.floor((rangeEnd.getTime() - firstSunday.getTime()) / msPerDay) + 1;
    const totalWeeks = Math.ceil(totalDays / 7);

    const columns: { date: Date; key: string; count: number }[][] = [];
    let cursor = new Date(firstSunday);

    for (let w = 0; w < totalWeeks; w++) {
      const col: { date: Date; key: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const key = formatDateKey(cursor);
        const count = countsByDate.get(key) || 0;
        col.push({ date: new Date(cursor), key, count });
        cursor.setDate(cursor.getDate() + 1);
      }
      columns.push(col);
    }

    return { columns, rangeStart, rangeEnd };
  }, [countsByDate, weeks]);

  const monthLabels = useMemo(() => {
    const labels: string[] = [];
    let prevMonth: number | null = null;
    for (const col of grid.columns) {
      // consider only in-range cells and pick the earliest date in the column
      const inRangeCells = col.filter(
        (c) => c.date >= grid.rangeStart && c.date <= grid.rangeEnd
      );
      if (inRangeCells.length === 0) {
        labels.push('');
        continue;
      }
      const earliest = inRangeCells.reduce((a, b) => (a.date < b.date ? a : b));
      const m = earliest.date.getMonth();
      if (prevMonth === null || m !== prevMonth) {
        labels.push(monthNames[m]);
        prevMonth = m;
      } else {
        labels.push('');
      }
    }
    return labels;
  }, [grid]);

  if (loading) {
    return (
      <div className="h-24 flex items-center justify-center text-sm text-gray-500">Loading activity…</div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="w-full mt-8">
        <h2 className="text-lg mb-6">Completed lessions</h2>
      <div className="flex gap-2 items-start">
        <div className="flex flex-col mr-1">
          {/* top spacer to align with month header height */}
          <div className="h-2 mb-1" />
          <div className="grid auto-rows-[10px] gap-1 text-[10px] text-gray-500">
            {dayNames.map((n, i) => (
              <div key={n} className={`${i % 2 === 1 ? '' : 'invisible'} h-2.5 leading-[10px] flex items-center`}>
                {n}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex flex-col">
            <div className="flex gap-1 text-[10px] text-gray-500 mb-1">
              {monthLabels.map((label, i) => (
                <div key={i} className="w-2.5 h-2 flex items-center justify-start">
                  {label}
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              {grid.columns.map((col, i) => (
                <div key={i} className="grid auto-rows-[10px] gap-1">
                  {col.map((cell) => {
                    const inRange =
                      cell.date >= grid.rangeStart && cell.date <= grid.rangeEnd;
                    if (!inRange) {
                      return (
                        <div key={cell.key} className="w-2.5 h-2.5 rounded-sm bg-transparent" />
                      );
                    }
                    return (
                      <div
                        key={cell.key}
                        className={`w-2.5 h-2.5 rounded-sm ${classForCount(cell.count)}`}
                        title={`${cell.count} hoạt động vào ${formatDisplayDateKey(cell.key)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 justify-end">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-200" />
          <div className="w-2.5 h-2.5 rounded-sm bg-green-100" />
          <div className="w-2.5 h-2.5 rounded-sm bg-green-300" />
          <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
          <div className="w-2.5 h-2.5 rounded-sm bg-green-700" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;

/**
 * Tests that verify chart data is properly processed and ready for rendering
 * This tests the full pipeline: fetch -> process -> render-ready
 */

import { fetchChartData } from '@/lib/supabase/fetchMachineTimelines';
import { fillTimeGaps } from '@/lib/utils/chartData';
import { IntervalType } from '@/types/interval';
import { invalidateCache } from '@/lib/supabase/fetchMachineTimelines';

const testStartDate = new Date(2020, 8, 1); // Sept 1, 2020
const testEndDate = new Date(2020, 8, 30); // Sept 30, 2020
const testInterval = IntervalType.Day;

// Real machine with data
const testMachine = {
  board: 2,
  port: 24,
  machine_id: 3,
  machine_name: 'C2',
};

describe('Chart Data Processing and Rendering', () => {
  beforeEach(() => {
    invalidateCache();
  });

  test('should fetch and process chart data ready for rendering', async () => {
    console.log('\nTesting Full Chart Data Pipeline:\n');

    // Step 1: Fetch raw data from database
    const fetchStart = performance.now();
    const rawData = await fetchChartData(
      testMachine.board,
      testMachine.port,
      testStartDate,
      testEndDate,
      testInterval,
      false
    );
    const fetchTime = performance.now() - fetchStart;

    console.log(`   1. Fetch: ${fetchTime.toFixed(0)}ms (${rawData.length} data points)`);
    expect(Array.isArray(rawData)).toBe(true);
    expect(rawData.length).toBeGreaterThan(0);

    // Step 2: Process data (fill gaps) - this is what TimelineRow does
    const processStart = performance.now();
    const processedData = fillTimeGaps(
      rawData,
      testStartDate,
      testEndDate,
      testInterval
    );
    const processTime = performance.now() - processStart;

    console.log(`   2. Process (fill gaps): ${processTime.toFixed(0)}ms (${processedData.length} points after gap filling)`);
    expect(Array.isArray(processedData)).toBe(true);
    expect(processedData.length).toBeGreaterThanOrEqual(rawData.length);

    // Step 3: Verify data is render-ready (has all required fields)
    const renderReady = processedData.every((point) => {
      return (
        typeof point.truncated_timestamp === 'string' &&
        typeof point.total_shots === 'number' &&
        (typeof point.average_shot_time === 'number' || point.average_shot_time === null)
      );
    });

    console.log(`   3. Render-ready: ${renderReady ? 'YES' : 'NO'}`);
    expect(renderReady).toBe(true);

    // Step 4: Verify time series is continuous (no gaps for chart rendering)
    const timestamps = processedData.map(p => new Date(p.truncated_timestamp).getTime()).sort((a, b) => a - b);
    const hasGaps = timestamps.some((ts, i) => {
      if (i === 0) return false;
      const prevTs = timestamps[i - 1];
      const expectedDiff = getExpectedIntervalMs(testInterval);
      const actualDiff = ts - prevTs;
      // Allow small variance (10%)
      return Math.abs(actualDiff - expectedDiff) > expectedDiff * 0.1;
    });

    console.log(`   4. Continuous time series: ${!hasGaps ? 'YES' : 'WARNING (has gaps)'}`);
    console.log(`   Total pipeline time: ${(fetchTime + processTime).toFixed(0)}ms`);
    console.log(`   Data points: ${rawData.length} → ${processedData.length} (after gap filling)`);

    // Data should be ready for chart rendering
    expect(processedData.length).toBeGreaterThan(0);
  }, 30000);

  test('should handle empty data gracefully (fill with zeros)', async () => {
    // Test with a machine that likely has no data
    const emptyData = await fetchChartData(
      2,
      99, // Port that likely has no data
      testStartDate,
      testEndDate,
      testInterval,
      false
    );

    // Even with no data, fillTimeGaps should create a continuous series
    const filledData = fillTimeGaps(
      emptyData,
      testStartDate,
      testEndDate,
      testInterval
    );

    console.log(`\n   Empty data test: ${emptyData.length} raw → ${filledData.length} filled`);
    
    // Should have filled data points even if original was empty
    expect(filledData.length).toBeGreaterThan(0);
    
    // All filled points should have zero shots
    const allZeros = filledData.every(p => p.total_shots === 0);
    expect(allZeros).toBe(true);
  }, 30000);
});

function getExpectedIntervalMs(interval: IntervalType): number {
  switch (interval) {
    case IntervalType.Minute:
      return 60 * 1000;
    case IntervalType.FiveMinute:
      return 5 * 60 * 1000;
    case IntervalType.Hour:
      return 60 * 60 * 1000;
    case IntervalType.Day:
      return 24 * 60 * 60 * 1000;
    case IntervalType.Week:
      return 7 * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000;
  }
}

#!/usr/bin/env ts-node
/**
 * Quick performance benchmark script
 * Run with: npx ts-node scripts/benchmark-timeline.ts
 */

import { fetchChartData, invalidateCache } from '../src/lib/supabase/fetchMachineTimelines';
import { IntervalType } from '../src/types/interval';

// Real user scenario: 12 visible + 2 buffer = 14 machines
const VISIBLE_MACHINES = 12;
const BUFFER_ROWS = 2;
const TOTAL_MACHINES = VISIBLE_MACHINES + BUFFER_ROWS; // 14
const MAX_TARGET_TIME = 5000; // 5 seconds

async function benchmark() {
  console.log('🚀 Timeline Loading Performance Benchmark\n');
  console.log('=' .repeat(50));

  // Clear cache to simulate fresh page load
  console.log('\n🧹 Clearing cache...');
  invalidateCache();

  const testStartDate = new Date(2020, 8, 1);
  const testEndDate = new Date(2020, 8, 30);
  const testInterval = IntervalType.Day;

  // Simulate real user: 12 visible + 2 buffer = 14 machines
  const machines = Array.from({ length: TOTAL_MACHINES }, (_, i) => ({
    board: 2,
    port: 24 + i,
  }));

  console.log(`\n📊 Loading ${TOTAL_MACHINES} machines (${VISIBLE_MACHINES} visible + ${BUFFER_ROWS} buffer)...\n`);

  const startTime = performance.now();
  const requestTimes: number[] = [];

  // Load all visible machines
  const promises = machines.map(async ({ board, port }, index) => {
    const requestStart = performance.now();
    try {
      const data = await fetchChartData(
        board,
        port,
        testStartDate,
        testEndDate,
        testInterval,
        false // hasEnergyMonitoring
      );
      const requestTime = performance.now() - requestStart;
      requestTimes.push(requestTime);
      console.log(`  ✅ Machine ${index + 1} (board ${board}, port ${port}): ${requestTime.toFixed(0)}ms (${data.length} data points)`);
      return data;
    } catch (error) {
      const requestTime = performance.now() - requestStart;
      requestTimes.push(requestTime);
      console.log(`  ❌ Machine ${index + 1} (board ${board}, port ${port}): ${requestTime.toFixed(0)}ms - ERROR`);
      throw error;
    }
  });

  try {
    await Promise.all(promises);
    const totalTime = performance.now() - startTime;

    const avgTime = requestTimes.reduce((a, b) => a + b, 0) / requestTimes.length;
    const minTime = Math.min(...requestTimes);
    const maxTime = Math.max(...requestTimes);

    console.log('\n' + '='.repeat(50));
    console.log('\n📈 Performance Results:\n');
    console.log(`  Total Time:        ${totalTime.toFixed(0)}ms (${(totalTime / 1000).toFixed(1)}s)`);
    console.log(`  Target:            < ${MAX_TARGET_TIME}ms`);
    console.log(`  Average Request:    ${avgTime.toFixed(0)}ms`);
    console.log(`  Fastest Request:    ${minTime}ms`);
    console.log(`  Slowest Request:    ${maxTime}ms`);
    console.log(`  Requests:          ${TOTAL_MACHINES} (${VISIBLE_MACHINES} visible + ${BUFFER_ROWS} buffer)`);

    console.log('\n' + '='.repeat(50));
    
    if (totalTime <= MAX_TARGET_TIME) {
      console.log('\n✅ PASS: All charts loaded within target time!\n');
      process.exit(0);
    } else if (totalTime <= MAX_TARGET_TIME * 2) {
      console.log('\n⚠️  ACCEPTABLE: Loaded within 2x target time');
      console.log('   Consider optimizing database queries or indexes\n');
      process.exit(0);
    } else {
      console.log('\n❌ FAIL: Exceeded acceptable load time');
      console.log('   Investigation needed:\n');
      console.log('   1. Check database indexes');
      console.log('   2. Verify throttling is working');
      console.log('   3. Check database connection/network\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR during benchmark:', error);
    process.exit(1);
  }
}

// Run benchmark
benchmark().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

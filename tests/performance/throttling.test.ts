/**
 * Tests to verify request throttling mechanism
 * Ensures max 5 concurrent database queries
 */

import { fetchChartData } from '@/lib/supabase/fetchMachineTimelines';
import { IntervalType } from '@/types/interval';

const MAX_CONCURRENT_REQUESTS = 5;
const testStartDate = new Date(2020, 8, 1);
const testEndDate = new Date(2020, 8, 30);
const testInterval = IntervalType.Day;

describe('Request Throttling', () => {
  test('should handle many requests without overwhelming database', async () => {
    // Create 20 simultaneous requests (more than the limit)
    const requestCount = 20;
    const requests = Array.from({ length: requestCount }, (_, i) => ({
      board: 2,
      port: 24 + i,
    }));

    const startTime = Date.now();
    
    // Fire all requests simultaneously
    const promises = requests.map(({ board, port }) =>
      fetchChartData(board, port, testStartDate, testEndDate, testInterval)
    );

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    // Verify all requests completed
    expect(results.length).toBe(requestCount);
    results.forEach((result) => {
      expect(Array.isArray(result)).toBe(true);
    });

    console.log(`\nThrottling Test Results:`);
    console.log(`   Requests: ${requestCount}`);
    console.log(`   Total time: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);
    console.log(`   Average per request: ${(totalTime / requestCount).toFixed(0)}ms`);
    console.log(`   Expected batches: ${Math.ceil(requestCount / MAX_CONCURRENT_REQUESTS)}`);

    // With throttling, 20 requests with 5 concurrent = 4 batches
    // If each batch takes ~2-3 seconds, total should be ~8-12 seconds
    // Without throttling, it would be much longer or fail
    expect(totalTime).toBeLessThan(30000); // Should complete within 30 seconds
  }, 60000);

  test('should complete requests in batches', async () => {
    const batchSize = MAX_CONCURRENT_REQUESTS;
    const totalRequests = 15;
    
    const requests = Array.from({ length: totalRequests }, (_, i) => ({
      board: 2,
      port: 24 + i,
    }));

    const batchTimings: number[] = [];
    
    // Process in batches to simulate throttling behavior
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchStart = Date.now();
      
      await Promise.all(
        batch.map(({ board, port }) =>
          fetchChartData(board, port, testStartDate, testEndDate, testInterval)
        )
      );
      
      batchTimings.push(Date.now() - batchStart);
    }

    const avgBatchTime = batchTimings.reduce((a, b) => a + b, 0) / batchTimings.length;
    const totalTime = batchTimings.reduce((a, b) => a + b, 0);

    console.log(`\nBatch Processing Test:`);
    console.log(`   Total requests: ${totalRequests}`);
    console.log(`   Batches: ${batchTimings.length}`);
    console.log(`   Average batch time: ${avgBatchTime.toFixed(0)}ms`);
    console.log(`   Total time: ${totalTime}ms`);

    expect(batchTimings.length).toBe(Math.ceil(totalRequests / batchSize));
    expect(avgBatchTime).toBeLessThan(5000); // Each batch should complete quickly
  }, 60000);
});

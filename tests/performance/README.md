# Performance Tests

This directory contains performance tests to verify that the timeline page loads within the target time of **5 seconds** for visible charts.

## Running Tests

```bash
# Run all performance tests
npm test -- tests/performance

# Run specific test file
npm test -- tests/performance/timeline-loading.test.ts

# Run with verbose output to see performance metrics
npm test -- tests/performance --verbose
```

## Test Files

### `timeline-loading.test.ts`
Tests the overall loading performance:
- Visible charts load within 5 seconds
- Progressive loading (visible first, then others)
- Individual request performance benchmarks
- Full page load simulation

### `throttling.test.ts`
Tests the request throttling mechanism:
- Max 5 concurrent requests
- Batch processing behavior
- Handles many requests without overwhelming database

## Performance Targets

| Metric | Target | Acceptable |
|--------|--------|------------|
| Visible charts (8 machines) | < 5s | < 10s |
| Individual request | < 2s | < 5s |
| Batch of 5 requests | < 3s | < 6s |
| 20 requests (throttled) | < 15s | < 30s |

## Understanding Results

### Good Performance
```
Total time: 4500ms
Average request time: 560ms
Max request time: 1200ms
```
- All metrics under targets
- Smooth user experience

### Acceptable Performance
```
Total time: 8000ms
Average request time: 1000ms
Max request time: 2500ms
```
- Slightly over target but acceptable
- May need optimization

### Poor Performance
```
Total time: 40000ms
Average request time: 5000ms
Max request time: 10000ms
```
- Needs investigation
- Check database indexes
- Verify throttling is working

## Troubleshooting

If tests are failing or slow:

1. **Check database connection**
   - Verify Supabase connection is working
   - Check network latency

2. **Verify indexes exist**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM pg_indexes 
   WHERE tablename IN ('monitoring_data_202009', 'monitoring_data_202010')
   AND indexname LIKE '%board_port_timestamp%';
   ```

3. **Check throttling is active**
   - Look for "Max concurrent requests" in logs
   - Should be ≤ 5

4. **Database performance**
   - Check if database is under load
   - Verify the optimized function is deployed:
   ```sql
   SELECT proname, prosrc 
   FROM pg_proc 
   WHERE proname = 'get_monitoring_intervals';
   ```

## Notes

- Tests use real database connections (not mocked)
- Requires valid Supabase credentials in `.env`
- Tests may take 30-60 seconds to complete
- Results may vary based on database load

export const GX_SCORE_CONFIG = {
  dimension_count: 12,
  anti_gaming_daily_cap: 15,
  anti_gaming_dimension_cap: 5,
  recalc_debounce_ms: 300000,
  session_timeout_ms: 1800000,
  copilot_rate_limit: 50,
  copilot_token_budget: {
    input: 4000,
    output: 2000,
  },
  match_cache_ttl_hours: 24,
  explanation_cache_ttl_hours: 1,
  batch_chunk_size: 10,
  max_batch_students: 100,
  max_retries: 3,
  retry_delays_ms: [1000, 2000, 4000],
} as const;

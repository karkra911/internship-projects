# Trader Performance vs Market Sentiment

## Scope

Datasets analyzed:

- `fear_greed_index.csv`: 2,644 daily sentiment records from 2018-02-01 to 2025-05-02.
- `historical_data.csv`: 211,224 Hyperliquid trade fills from 2023-05-01 01:06 IST to 2025-05-01 12:13 IST.

Join method:

- Trade timestamps were parsed from `Timestamp IST`.
- Each trade was joined to the Fear and Greed dataset by calendar date.
- 211,218 of 211,224 trades matched sentiment records. The 6 unmatched rows were on 2024-10-26 and all came from one EIGEN account/date cluster.
- Performance is reported as realized `Closed PnL` minus `Fee`.
- Rows with zero `Closed PnL` are included in activity/fee/volume metrics, while win rate and average closing PnL are based on non-zero closing outcomes.

## Dataset Snapshot

| Metric | Value |
|---|---:|
| Trade rows | 211,224 |
| Accounts | 32 |
| Coins | 246 |
| Rows with non-zero closed PnL | 104,408 |
| Total size USD | 1,191,187,442 |
| Gross closed PnL | 10,296,959 |
| Fees | 245,858 |
| Net PnL | 10,051,101 |
| Net PnL / volume | 84.38 bps |

Top traded coins by row count:

| Coin | Rows |
|---|---:|
| HYPE | 68,005 |
| @107 | 29,992 |
| BTC | 26,064 |
| ETH | 11,158 |
| SOL | 10,691 |
| FARTCOIN | 4,650 |
| MELANIA | 4,428 |

## Sentiment-Level Performance

| Sentiment | Trades | Closing Rows | Volume USD | Net PnL | Net bps | Win Rate | Avg PnL / Close | Profit Factor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Extreme Fear | 21,400 | 10,406 | 114,484,261 | 715,222 | 62.47 | 76.2% | 71.03 | 2.16 |
| Fear | 61,837 | 29,808 | 483,324,790 | 3,264,698 | 67.55 | 87.3% | 112.63 | 6.66 |
| Neutral | 37,686 | 18,159 | 180,242,063 | 1,253,546 | 69.55 | 82.4% | 71.20 | 4.32 |
| Greed | 50,303 | 25,176 | 288,582,495 | 2,087,031 | 72.32 | 76.9% | 85.40 | 3.03 |
| Extreme Greed | 39,992 | 20,853 | 124,465,165 | 2,688,141 | 215.98 | 89.2% | 130.21 | 11.02 |

## Main Findings

1. Extreme Greed had the strongest normalized performance.

   Extreme Greed produced 2.69M net PnL on only 124.5M volume, equal to 215.98 bps. That is more than 3x the normalized performance of Fear, Neutral, or Greed. It also had the best win rate at 89.2% and the highest profit factor at 11.02.

2. Fear had the largest absolute net PnL, but mostly because it had the most volume.

   Fear generated 3.26M net PnL, the highest absolute total, but it also carried 483.3M volume. Normalized performance was 67.55 bps, similar to Extreme Fear, Neutral, and Greed.

3. The relationship between sentiment score and daily performance is weak.

   Across 419 trading days with closing PnL, daily Fear and Greed value had weak correlation with net PnL (-0.094) and net bps (0.072). Sentiment alone does not explain daily profitability well. It works better as a regime feature combined with coin, direction, and trader behavior.

4. Performance is concentrated.

   The top 5 coin-sentiment combinations generated 4.94M net PnL, about 49.1% of total net PnL. The top 5 account-sentiment combinations generated 3.83M net PnL, about 38.1% of total net PnL. This means broad sentiment conclusions are partly driven by specific symbols and traders.

5. Closing shorts performed especially well in fearful markets.

   `Close Short` in Fear generated 1.90M net PnL with 252.2 bps, while `Close Short` in Extreme Fear generated 382K net PnL with 308.3 bps. This suggests traders were often profitable covering shorts during fear regimes.

6. Selling into greedy regimes was very strong, but label interpretation matters.

   Direction value `Sell` in Extreme Greed generated 2.08M net PnL, 2052.9 bps, and a 92.5% win rate. However, `Sell` is not always equivalent to opening a short; it can include spot/perp sell behavior depending on the source event. Treat this as a high-value segment for deeper trade reconstruction.

7. Some coin-regime pairs are consistently hazardous.

   The worst observed segment was TRUMP during Greed: -433K net PnL, -2505.1 bps, 39.6% win rate, and 0.01 profit factor. FARTCOIN in Extreme Fear and @107 in Extreme Fear were also strongly negative.

## Best Coin-Sentiment Segments

Minimum 20 closing rows.

| Coin + Sentiment | Net PnL | Net bps | Closing Rows | Win Rate | Profit Factor |
|---|---:|---:|---:|---:|---:|
| @107 + Extreme Greed | 1,986,856 | 971.4 | 6,341 | 92.1% | 89.5 |
| HYPE + Fear | 828,972 | 130.9 | 13,537 | 89.7% | 13.4 |
| SOL + Fear | 730,044 | 140.9 | 2,061 | 95.0% | 14.0 |
| @107 + Greed | 722,746 | 427.1 | 5,038 | 76.5% | 6.6 |
| ETH + Fear | 668,901 | 168.8 | 1,428 | 83.2% | 4.0 |

## Worst Coin-Sentiment Segments

Minimum 20 closing rows.

| Coin + Sentiment | Net PnL | Net bps | Closing Rows | Win Rate | Profit Factor |
|---|---:|---:|---:|---:|---:|
| TRUMP + Greed | -433,382 | -2505.1 | 369 | 39.6% | 0.01 |
| FARTCOIN + Extreme Fear | -138,233 | -1413.3 | 329 | 15.8% | 0.02 |
| @107 + Extreme Fear | -136,432 | -549.2 | 886 | 42.4% | 0.10 |
| ETH + Extreme Greed | -45,802 | -28.6 | 713 | 72.5% | 0.72 |
| ADA + Extreme Fear | -31,369 | -524.8 | 94 | 1.1% | 0.00 |

## Strategy Implications

1. Use sentiment as a regime filter, not a standalone signal.

   The weak daily correlation means a naive "higher sentiment equals better trade" rule is not supported. Sentiment becomes useful when crossed with coin, direction, and account/trader style.

2. Prioritize regime-specific playbooks.

   - Extreme Greed: strongest normalized edge, especially `Sell` activity and @107.
   - Fear: highest absolute PnL and strong results in HYPE, SOL, ETH, and BTC.
   - Extreme Fear: mixed regime; profitable overall, but hazardous for FARTCOIN, @107, ADA, and some accounts.

3. Add risk controls for toxic coin-regime pairs.

   A practical rule would reduce size, require stronger confirmation, or block discretionary entries in pairs such as TRUMP + Greed and FARTCOIN + Extreme Fear until there is evidence the behavior has changed.

4. Watch trader specialization.

   Some accounts were highly profitable in specific regimes and weak in others. A copy-trading or signal-ranking model should score accounts by sentiment regime rather than using one global account score.

5. Separate position opens from exits before production use.

   The dataset has fill-level rows and mixed direction labels such as `Open Long`, `Close Long`, `Sell`, and `Buy`. For strategy execution, reconstruct round-trip trades by account, coin, and position state so entry timing, exit timing, holding period, and leverage/risk can be evaluated directly.

## Caveats

- The provided historical trade file does not include an explicit `leverage` column, despite the prompt mentioning leverage.
- Fill-level rows are not the same as full trades. A large order split into many fills can overweight one decision.
- `Closed PnL` is only realized PnL on closing fills; opening fills generally show zero PnL but still affect volume and fees.
- The strongest patterns may reflect account and symbol concentration rather than sentiment alone.
- These results are historical and should be validated out-of-sample before being used in live trading.

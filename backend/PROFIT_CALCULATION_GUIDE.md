# Backend Implementation: Incremental Cost Calculation

## 📌 What Changed

### Backend API
- **Endpoint**: `POST /api/profits/calculate` (unchanged)
- **Response**: Returns profit cycle with incremental cost calculation
- **Breaking Changes**: None ✅

### Data Model
Added to `profit_cycles` table:
- Column: `imported_items_snapshot` (JSON)
- Purpose: Store state of inventory at each cycle for next cycle's calculation

---

## 🔄 How It Works Now

### Cycle 1 (First Calculation)
```
Cost = Sum of (consumed quantity × cost_price)
  where consumed = initial_qty - current_remaining_qty

Example:
- Flour: (100 - 75) × 10 = 250k
- Sugar: (50 - 35) × 15 = 225k
- Total: 475k
```

### Cycle 2+ (Incremental Calculation)
```
Cost = Sum of (incremental_consumed × cost_price)
  where incremental_consumed = previous_remaining - current_remaining

Example:
- Flour: (75 - 55) × 10 = 200k  ← Not (100-55)!
- Sugar: (35 - 25) × 15 = 150k  ← Not (50-25)!
- Total: 350k  ← Much less than if calculated from beginning
```

---

## 🧪 Real-World Example

**Scenario**: Coffee shop with Arabica beans supply

```
WEEK 1 (Cycle 1)
├─ Import: 100kg @ 500k/kg
├─ At end of week: 70kg remaining
├─ Consumed: 30kg
├─ Cost: 30 × 500k = 15M VND
└─ Revenue: 50M VND
└─ Profit: 50M - 15M = 35M VND ✅

WEEK 2 (Cycle 2)
├─ Same beans, no new import
├─ At end of week: 40kg remaining
├─ Incremental consumed: 70 - 40 = 30kg (NOT 100-40=60!)
├─ Cost: 30 × 500k = 15M VND
└─ Revenue: 48M VND
└─ Profit: 48M - 15M = 33M VND ✅

WEEK 3 (Cycle 3)
├─ Same beans, no new import  
├─ At end of week: 10kg remaining
├─ Incremental consumed: 40 - 10 = 30kg
├─ Cost: 30 × 500k = 15M VND
└─ Revenue: 45M VND
└─ Profit: 45M - 15M = 30M VND ✅
```

**OLD BEHAVIOR** (Wrong):
- Week 2: Cost = (100-40) × 500k = 30M → Profit = 18M (WRONG! Double-counted Week 1)
- Week 3: Cost = (100-10) × 500k = 45M → Profit = 0M (WRONG! Counting all 3 weeks)

---

## 📊 API Response Format

### GET /api/profits
Returns array of profit cycles:
```json
[
  {
    "id": 1,
    "start_date": "2026-02-01T00:00:00Z",
    "end_date": "2026-02-08T00:00:00Z",
    "revenue": 50000000,
    "cost": 15000000,
    "profit": 35000000,
    "status": "closed",
    "revenue_details": {
      "totalOrders": 125,
      "items": [
        {
          "productId": 1,
          "productName": "Coffee (Arabica)",
          "qty": 30,
          "unitPrice": 500000,
          "total": 15000000
        }
      ],
      "orders": [...]
    },
    "cost_details": {
      "items": [
        {
          "importItemId": 5,
          "ingredientName": "Arabica Beans",
          "importDate": "2026-01-25T00:00:00Z",
          "currentRemaining": 70,
          "previousRemaining": 100,    // ← From previous cycle or initial
          "consumedQty": 30,            // ← INCREMENTAL
          "costPrice": 500000,
          "totalCost": 15000000
        }
      ]
    },
    "imported_items_snapshot": [
      {
        "id": 5,
        "import_order_id": 2,
        "ingredient_id": 1,
        "remaining_qty": 70
      }
    ]
  }
]
```

---

## ✅ Testing the Feature

### Step 1: Create First Profit Cycle
```
1. Import 100 units of Flour @ 10k
2. Use 25 units in business
3. Click "TÍNH LỢI NHUẬN" (Calculate Profit)
4. Cost should be: 25 × 10k = 250k
```

### Step 2: Create Second Profit Cycle
```
1. No new import (still 75 units remaining)
2. Use 20 more units in business
3. Click "TÍNH LỢI NHUẬN" again
4. Cost should be: 20 × 10k = 200k (NOT 45 × 10k = 450k!)
5. Verify by comparing with Cycle 1
```

### Step 3: Create Third Profit Cycle
```
1. Use 10 more units
2. Click "TÍNH LỢI NHUẬN" again
3. Cost should be: 10 × 10k = 100k
4. Total consumption: 25 + 20 + 10 = 55 units ✅
```

---

## 🎯 Expected Results

| Cycle | Revenue | Cost | Profit | Consumed | Notes |
|-------|---------|------|--------|----------|-------|
| 1     | 50M     | 15M  | 35M    | 30kg     | All consumption |
| 2     | 48M     | 15M  | 33M    | 30kg     | Only this period |
| 3     | 45M     | 15M  | 30M    | 30kg     | Only this period |
| Total | 143M    | 45M  | 98M    | 90kg     | Correct total |

**OLD BEHAVIOR** would have been:
- Cycle 2: Cost = 30M (WRONG)
- Cycle 3: Cost = 45M (WRONG)
- Total Profit: 23M (WRONG)

---

## 🔧 Troubleshooting

### Issue: Cost is still being calculated from beginning
**Solution**: Make sure backend is restarted after migration
```bash
npm run db:migrate          # Apply migrations
npx tsx src/server.ts       # Restart server
```

### Issue: cost_details shows wrong consumed values
**Solution**: Check that `imported_items_snapshot` is being populated
- First cycle creates snapshot
- Second cycle reads and compares with snapshot

### Issue: New import in Cycle 2
**Solution**: Already handled! If item not in snapshot:
- Treats as new import
- Consumes = qty - remaining (from beginning for this item)

---

## 📝 Implementation Details

### Files Modified
1. `src/models/ProfitCycle.ts` - Added snapshot field
2. `src/migrations/20260211000000-add-imported-items-snapshot.cjs` - DB migration
3. `src/controllers/ProfitController.ts` - Cost calculation logic

### Algorithm Complexity
- Time: O(n) where n = number of import items
- Space: O(n) for snapshot storage
- Performance: Negligible impact

### Data Integrity
- Snapshots are read-only (used for comparison only)
- No data modification in snapshot
- Safe to store in JSON column

---

## ✨ Benefits

1. **Accurate Period Profit**: Each cycle shows true profit for that period
2. **No Double Counting**: Consumption counted only once
3. **Cost Tracking**: Can track cost changes per period
4. **Historical Data**: Can analyze period-over-period changes
5. **Inventory Insight**: See consumption patterns by period

---

## 🚀 Next Steps

1. Test with actual business data
2. Verify cost calculations match manual calculations
3. Use for financial reporting
4. Analyze consumption trends across periods


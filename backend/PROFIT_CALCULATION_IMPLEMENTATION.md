# Profit Cycle Incremental Cost Calculation - Implementation Summary

## Problem Statement
- **Issue**: Chi phí (cost) được tính từ đầu mỗi lần tính chu kỳ lợi nhuận
- **Expected**: 
  - Lần 1: Tính tất cả chi phí từ đầu
  - Lần 2+: Chỉ tính chi phí gia tăng so với chu kỳ trước

## Root Cause
Logic cũ trong `calculateProfitCycle`:
```typescript
const consumed = Number(item.qty) - Number(item.remaining_qty);
```
Cách này LUÔN tính từ đầu (từ qty gốc), không track lịch sử.

## Solution Implemented

### 1. Model Changes
**File**: `backend/src/models/ProfitCycle.ts`
- Thêm field `imported_items_snapshot: any` để lưu trạng thái của các import items tại thời điểm tạo chu kỳ

### 2. Database Migration
**File**: `backend/src/migrations/20260211000000-add-imported-items-snapshot.cjs`
- Thêm column `imported_items_snapshot` (JSON) vào bảng `profit_cycles`

### 3. Logic Calculation (Main Fix)
**File**: `backend/src/controllers/ProfitController.ts` - Method `calculateProfitCycle`

**New Logic**:
```
IF no previous cycle OR no snapshot:
  // FIRST CYCLE
  consumed = current_qty - current_remaining
ELSE:
  // SUBSEQUENT CYCLES
  consumed = previous_remaining - current_remaining
```

**Chi tiết**:
1. Lấy chu kỳ trước và snapshot của nó
2. Với mỗi import item:
   - Nếu lần đầu tiên: consumed = qty - remaining (tất cả)
   - Nếu không: consumed = previous_remaining - current_remaining (chỉ gia tăng)
3. Lưu current state vào `currentSnapshot` để chu kỳ sau sử dụng

### 4. Cost Details Format
Đã cập nhật format để show rõ hơn:
```typescript
{
  importItemId: number,
  ingredientName: string,
  currentRemaining: number,
  previousRemaining: number,
  consumedQty: number (incremental),
  costPrice: number,
  totalCost: number
}
```

## Example Scenario

**Cycle 1** (Lần đầu):
- Import: 100 units @ 10k/unit
- Current remaining: 80 units
- Consumed: 100 - 80 = 20 units → Chi phí: 20 × 10k = 200k
- Snapshot saved: remaining_qty = 80

**Cycle 2** (Lần 2):
- Import: 100 units @ 10k/unit (same)
- Current remaining: 60 units
- Previous remaining (from snapshot): 80 units
- Consumed: 80 - 60 = 20 units (incremental) → Chi phí: 20 × 10k = 200k
- Snapshot saved: remaining_qty = 60

**Cycle 3** (Lần 3):
- Current remaining: 50 units
- Previous remaining: 60 units
- Consumed: 60 - 50 = 10 units → Chi phí: 10 × 10k = 100k
- Snapshot saved: remaining_qty = 50

## Benefits
✅ Chi phí được tính chính xác theo từng giai đoạn
✅ Không bị double-count consumption
✅ Lợi nhuận chính xác từng chu kỳ
✅ Có thể track lịch sử consumption qua các chu kỳ

## Files Modified
1. ✅ `backend/src/models/ProfitCycle.ts` - Thêm field snapshot
2. ✅ `backend/src/migrations/20260211000000-add-imported-items-snapshot.cjs` - Migration
3. ✅ `backend/src/controllers/ProfitController.ts` - Logic incremental calculation

## Testing Notes
- Server successfully compiled (no TypeScript errors)
- Migration applied successfully
- Endpoints responding correctly
- Ready for integration testing with frontend

## Next Steps (Frontend)
1. Tính lợi nhuận chu kỳ 1
2. Xem chi phí được tính chính xác
3. Tính lợi nhuận chu kỳ 2
4. Verify chi phí chỉ tính phần gia tăng
5. Compare với Expected Values


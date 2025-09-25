# Table Migration Guide

This guide shows how to use the new DataTable pattern across the application, matching the advanced implementation from `/dashboard`.

## Core Components

### 1. UniversalDataTable
Location: `/components/ui/universal-data-table.tsx`
- Main table component with all advanced features
- Supports drag & drop, sorting, filtering, pagination
- Includes sheet-based detail views

### 2. Shared Types
Location: `/lib/table/types.ts`
- TableConfig, TableFilter, TableTab, TableAction interfaces
- Provides type safety for all table configurations

### 3. useDataTable Hook
Location: `/hooks/use-data-table.ts`
- Manages table state and data operations
- Handles selection, sorting, filtering, pagination

## Implementation Examples

### Product Table (Completed)
```tsx
import { ProductTableV2 } from '@/components/products/product-table-v2'

// Usage in page
<ProductTableV2
  products={products}
  categories={categories}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAddProduct={handleAdd}
/>
```

### Price History Table (Completed)
```tsx
import { PriceHistoryTableV2 } from '@/components/pricing/price-history-table-v2'

// Usage in page
<PriceHistoryTableV2
  history={priceHistory}
  onExport={handleExport}
  onGenerateReport={handleReport}
/>
```

### Clients Table (Completed)
```tsx
import { ClientsTable } from '@/components/clients/clients-table'

// Usage in page
<ClientsTable
  clients={clients}
  onInvite={handleInvite}
  onResendInvite={handleResend}
  onExport={handleExport}
/>
```

## Key Features

All tables now include:
1. **Drag & Drop Reordering** - Rows can be reordered by dragging
2. **Multi-Column Sorting** - Click headers to sort
3. **Advanced Filtering** - Search and filter capabilities
4. **Row Selection** - Select individual or all rows
5. **Inline Editing** - Edit values directly in cells
6. **Sheet Detail Views** - Click to view/edit full details
7. **Bulk Actions** - Perform actions on selected rows
8. **Column Visibility** - Show/hide columns as needed
9. **Responsive Pagination** - Configurable page sizes
10. **Tabs Support** - Multiple views within same table

## Migration Steps for Other Tables

1. **Define Schema**
```tsx
const schema = z.object({
  id: z.string(),
  // ... other fields
})
```

2. **Create Columns**
```tsx
const columns: ColumnDef<DataType>[] = [
  {
    id: "drag",
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => <Checkbox ... />,
    cell: ({ row }) => <Checkbox ... />,
  },
  // ... other columns
]
```

3. **Configure Table**
```tsx
const config: TableConfig<DataType> = {
  columns,
  schema,
  enableDragAndDrop: true,
  enableSelection: true,
  enableInlineEdit: true,
  enableDetailView: true,
  defaultPageSize: 10,
}
```

4. **Use UniversalDataTable**
```tsx
<UniversalDataTable
  data={data}
  config={config}
  tabs={tabs}
  bulkActions={bulkActions}
  searchPlaceholder="Search..."
  heading={<h1>Title</h1>}
  description="Description"
  toolbar={<Button>Action</Button>}
/>
```

## Benefits

- **Consistency**: All tables work the same way
- **Feature Rich**: Advanced functionality out of the box
- **Maintainable**: Single source of truth for table logic
- **Type Safe**: Full TypeScript support
- **Performant**: Optimized rendering with virtual scrolling ready
- **Accessible**: ARIA labels and keyboard navigation

## Testing

Use Chrome DevTools (localhost:3001) to test:
1. Drag and drop functionality
2. Inline editing
3. Sheet detail views
4. Bulk actions
5. Responsive behavior
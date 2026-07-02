import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ReorderQueueItem, PurchaseOrder } from '../lib/types'
import { Package, AlertCircle, AlertTriangle, ShoppingCart, FileText, RefreshCw, Search, Download, ArrowUpDown, CheckSquare, Square } from 'lucide-react'

const STORE_ID = '00000000-0000-0000-0000-000000000001'

export default function ReorderPage() {
  const [queue, setQueue] = useState<ReorderQueueItem[]>([])
  const [draftPOs, setDraftPOs] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'status' | 'product' | 'supplier'>('status')
  const [filterStatus, setFilterStatus] = useState<'all' | 'zero' | 'critical' | 'low' | 'warning'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [generatingPO, setGeneratingPO] = useState(false)
  const [downloadingPO, setDownloadingPO] = useState<string | null>(null)
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null)
  const [editItems, setEditItems] = useState<any[]>([])
  const [printingPO, setPrintingPO] = useState<PurchaseOrder | null>(null)
  const printingRef = useRef<PurchaseOrder | null>(null)

  const loadData = async () => {
    try {
      const { data: queueData } = await supabase
        .from('reorder_queue')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('status', 'pending')
        .order('urgency_score', { ascending: false })
      if (queueData) setQueue(queueData as ReorderQueueItem[])

      const { data: poData } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('store_id', STORE_ID)
        .order('created_at', { ascending: false })
      if (poData) setDraftPOs(poData as PurchaseOrder[])
    } catch (err) {
      console.error('Error loading:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Urgency helpers — based on stock deficit severity
  const urgencyTier = (score: number, qty: number, threshold: number) => {
    if (qty === 0 || score >= 100) return 'zero'
    // Use deficit severity: how depleted are we?
    const deficit = threshold - qty
    const pctRemaining = threshold > 0 ? qty / threshold : 0
    if (pctRemaining <= 0.3 || deficit >= threshold * 0.7) return 'critical'
    if (pctRemaining <= 0.6 || deficit >= threshold * 0.4) return 'low'
    return 'warning'
  }

  const tierLabel = (tier: string) => {
    switch(tier) {
      case 'zero': return 'ZERO STOCK'
      case 'critical': return 'CRITICAL'
      case 'low': return 'LOW'
      case 'warning': return 'WARNING'
      default: return 'OK'
    }
  }

  // Filter + sort
  let filtered = [...queue]
  if (filterStatus !== 'all') {
    filtered = filtered.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === filterStatus)
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(i => 
      i.product_title.toLowerCase().includes(q) || 
      i.variant_title?.toLowerCase().includes(q) ||
      i.supplier_name?.toLowerCase().includes(q)
    )
  }
  if (sortBy === 'product') filtered.sort((a, b) => a.product_title.localeCompare(b.product_title))
  else if (sortBy === 'supplier') filtered.sort((a, b) => a.supplier_name.localeCompare(b.supplier_name))
  // 'status' = default (urgency_score descending)

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllFiltered = () => {
    const allIds = filtered.map(i => i.variant_id + i.status)
    setSelected(prev => {
      // If all already selected, deselect all — toggle behavior
      const allSelected = allIds.every(id => prev.has(id))
      if (allSelected) return new Set()
      const next = new Set(prev)
      for (const id of allIds) next.add(id)
      return next
    })
  }

  const selectedItems = queue.filter(i => selected.has(i.variant_id + i.status))

  const buildPO = async () => {
    if (selectedItems.length === 0) return
    setGeneratingPO(true)
    try {
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
      const { count } = await supabase.from('purchase_orders').select('*', { count: 'exact', head: true })
      const seq = ((count || 0) + 1).toString().padStart(3, '0')
      const poNumber = `PO-SUP-${dateStr}-${seq}`

      const suppliers = [...new Set(selectedItems.map(i => i.supplier_name || 'Unknown'))]
      const supplier = suppliers.length === 1 ? suppliers[0] : 'Mixed'

      const { error } = await supabase.from('purchase_orders').insert({
        store_id: STORE_ID, po_number: poNumber, supplier_name: supplier,
        status: 'draft',
        items: selectedItems.map(i => ({
          variant_id: i.variant_id, product_title: i.product_title,
          variant_title: i.variant_title, qty: i.suggested_reorder_qty,
          current_stock: i.current_qty,
        })),
        total_items: selectedItems.length,
        notes: `Bulk PO from reorder queue — ${selectedItems.length} items`,
      })
      if (error) { console.error('PO error:', error.message); return }

      for (const item of selectedItems) {
        await supabase.from('reorder_queue').update({ status: 'added_to_po' })
          .eq('store_id', STORE_ID).eq('variant_id', item.variant_id).eq('status', 'pending')
      }
      setSelected(new Set())
      await loadData()
    } finally { setGeneratingPO(false) }
  }

  const openPrintView = (po: PurchaseOrder) => {
    printingRef.current = po
    setPrintingPO(po)
    // Delay to let React render the print view before opening print dialog
    setTimeout(() => {
      if (document.getElementById('po-print-view')) {
        document.body.classList.add('printing-po')
        window.print()
      }
    }, 100)
  }

  const closePrintView = () => {
    document.body.classList.remove('printing-po')
    printingRef.current = null
    setPrintingPO(null)
  }

  // Listen for print dialog close to auto-hide the overlay
  useEffect(() => {
    const handler = () => {
      if (printingRef.current) closePrintView()
    }
    window.addEventListener('afterprint', handler)
    return () => window.removeEventListener('afterprint', handler)
  }, [])

  // Summary counts
  const zeroCount = queue.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'zero').length
  const criticalCount = queue.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'critical').length
  const lowCount = queue.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'low').length
  const warningCount = queue.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'warning').length

  // ─── PO Edit / Delete ──────────────────────────────────────────────────

  const openPOEditor = (po: PurchaseOrder) => {
    setEditingPO(po)
    setEditItems((po.items || []).map((item: any) => ({ ...item })))
  }

  const updateEditItemQty = (idx: number, qty: number) => {
    setEditItems(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], qty }
      return next
    })
  }

  const savePOEdits = async () => {
    if (!editingPO) return
    try {
      await supabase.from('purchase_orders').update({
        items: editItems,
        total_items: editItems.length,
      }).eq('id', editingPO.id)
      setEditingPO(null)
      setEditItems([])
      await loadData()
    } catch (err: any) {
      console.error('Save PO error:', err.message)
    }
  }

  const deletePO = async (poId: string) => {
    if (!window.confirm('Delete this purchase order? This cannot be undone.')) return
    try {
      await supabase.from('purchase_orders').delete().eq('id', poId)
      await loadData()
    } catch (err: any) {
      console.error('Delete PO error:', err.message)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reorder Queue</h1>
          <p className="text-xs text-gray-400">{queue.length} items below threshold</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Summary cards — keep */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-critical/10 rounded-lg px-4 py-3 border border-critical/20">
          <p className="text-xl font-bold text-critical">{zeroCount}</p>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Zero Stock</p>
        </div>
        <div className="bg-danger/10 rounded-lg px-4 py-3 border border-danger/20">
          <p className="text-xl font-bold text-danger">{criticalCount}</p>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Critical</p>
        </div>
        <div className="bg-warning/10 rounded-lg px-4 py-3 border border-warning/20">
          <p className="text-xl font-bold text-warning">{warningCount + lowCount}</p>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Warning/Low</p>
        </div>
        <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-200">
          <p className="text-xl font-bold text-blue-700">{draftPOs.length}</p>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Draft POs</p>
        </div>
      </div>

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm font-medium text-primary">
            {selected.size} item{selected.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button onClick={buildPO} disabled={generatingPO} className="px-4 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {generatingPO ? 'Building...' : `Build PO (${selected.size})`}
            </button>
          </div>
        </div>
      )}

      {/* Controls bar — sticky header */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3 sticky top-0 z-10">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..." 
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
            <option value="all">All Status</option>
            <option value="zero">Zero Stock</option>
            <option value="critical">Critical</option>
            <option value="low">Low</option>
            <option value="warning">Warning</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none">
            <option value="status">Sort: Urgency</option>
            <option value="product">Sort: Product Name</option>
            <option value="supplier">Sort: Supplier</option>
          </select>
          <button onClick={selectAllFiltered}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10">
            <CheckSquare className="w-3.5 h-3.5" /> {selected.size > 0 && filtered.every(i => selected.has(i.variant_id + i.status)) ? 'Deselect All' : 'Select All'}
          </button>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:text-gray-600">
              Clear ({selected.size})
            </button>
          )}
        </div>

        {/* Compact table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="w-10 px-3 py-2 text-center"></th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Variant</th>
                <th className="text-center px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="text-center px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Thresh</th>
                <th className="text-center px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Reorder</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="text-center px-2 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="w-8 px-2 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center text-gray-400 text-sm">No items match the current filters</td></tr>
              )}
              {filtered.map((item) => {
                const key = item.variant_id + item.status
                const tier = urgencyTier(item.urgency_score, item.current_qty, item.threshold_qty)
                const isSelected = selected.has(key)
                const colorClass = tier === 'zero' ? 'text-critical bg-critical/5 border-critical/20' :
                  tier === 'critical' ? 'text-danger bg-danger/5 border-danger/20' :
                  tier === 'low' ? 'text-warning bg-warning/5 border-warning/20' :
                  'text-amber-600 bg-amber-50/50 border-amber-200/50'

                return (
                  <tr key={key} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleSelect(key)} className="focus:outline-none">
                        {isSelected
                          ? <CheckSquare className="w-4 h-4 text-primary" />
                          : <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
                        {tier === 'zero' ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {tierLabel(tier)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-medium text-gray-900 block truncate max-w-[180px]">{item.product_title}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-500">{item.variant_title || '—'}</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`text-sm font-bold ${item.current_qty === 0 ? 'text-critical' : item.current_qty <= 5 ? 'text-danger' : 'text-gray-800'}`}>
                        {item.current_qty}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-xs text-gray-600 font-medium">{item.threshold_qty}</td>
                    <td className="px-2 py-2 text-center text-xs text-gray-800 font-semibold">{item.suggested_reorder_qty}</td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-500 truncate max-w-[120px] block">{item.supplier_name || '—'}</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-xs text-gray-500">{item.lead_time_days}d</span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => toggleSelect(key)}
                        className="text-[10px] text-primary hover:text-primary/80 font-medium whitespace-nowrap"
                      >{isSelected ? 'Remove' : 'Select'}</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draft POs section */}
      {draftPOs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Purchase Orders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {draftPOs.map(po => (
              <div key={po.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-gray-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{po.po_number}</p>
                    <p className="text-[10px] text-gray-400 truncate">{po.supplier_name} · {po.total_items} items · {new Date(po.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                    po.status === 'draft' ? 'bg-amber-50 text-amber-700' :
                    po.status === 'sent' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {po.status}
                  </span>
                  <button onClick={() => openPOEditor(po)}
                    className="px-2 py-1.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Edit</button>
                  <button onClick={() => deletePO(po.id)}
                    className="px-2 py-1.5 text-[10px] font-medium text-danger bg-danger/5 rounded-lg hover:bg-danger/10">Delete</button>
                  <button onClick={() => openPrintView(po)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PO Edit Modal */}
      {editingPO && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditingPO(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{editingPO.po_number}</h3>
                <p className="text-xs text-gray-400">{editingPO.supplier_name} · {editItems.length} items</p>
              </div>
              <button onClick={() => setEditingPO(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Scrollable items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              <p className="text-xs text-gray-400 mb-1">Edit order quantities — changes save to the PO.</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase">Product</th>
                    <th className="text-left py-2 text-[10px] font-semibold text-gray-500 uppercase">Variant</th>
                    <th className="text-center py-2 text-[10px] font-semibold text-gray-500 uppercase">Current Stock</th>
                    <th className="text-center py-2 text-[10px] font-semibold text-gray-500 uppercase w-24">Qty to Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {editItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-2">
                        <span className="text-xs font-medium text-gray-900">{item.product_title}</span>
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className="text-xs text-gray-500">{item.variant_title || '—'}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-xs text-gray-600">{item.current_stock ?? '?'}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <input
                          type="number"
                          min={0}
                          value={item.qty}
                          onChange={e => updateEditItemQty(idx, parseInt(e.target.value) || 0)}
                          className="w-20 text-center px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-gray-400">
                Total: {editItems.reduce((sum, i) => sum + (i.qty || 0), 0)} units across {editItems.length} items
              </div>
              <div className="flex gap-2">
                <button onClick={() => openPrintView(editingPO)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button onClick={() => deletePO(editingPO.id)}
                  className="px-4 py-2 text-xs font-medium text-danger bg-danger/5 border border-danger/20 rounded-xl hover:bg-danger/10">
                  Delete PO
                </button>
                <button onClick={savePOEdits}
                  className="px-5 py-2 text-xs font-medium text-white bg-primary rounded-xl hover:bg-primary/90 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print View — renders as a full-page PO for window.print() */}
      {printingPO && (
        <div id="po-print-view" className="fixed inset-0 z-[100] print:relative print:inset-auto">
          <style>{`
            @media print {
              @page { margin: 0.75in; size: A4; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
              body.printing-po #root { display: none !important; }
              #po-print-view { display: block !important; position: absolute !important; top: 0; left: 0; width: 100%; z-index: 999999; }
            }
            @media screen {
              #po-print-view { background: white; overflow-y: auto; }
            }
          `}</style>
          {/* Close button — hidden when printing */}
          <div className="print:hidden sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10">
            <p className="text-sm font-medium text-gray-600">
              <FileText className="w-4 h-4 inline mr-1.5" />
              Print Preview — Ctrl+P or Cmd+P to save as PDF
            </p>
            <button onClick={closePrintView} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Close
            </button>
          </div>
          <div className="p-8 max-w-[210mm] mx-auto" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
            {/* PO Header */}
            <h1 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', color: '#1e293b', marginBottom: 2 }}>PURCHASE ORDER</h1>
            <p style={{ fontSize: 13, fontWeight: 700, textAlign: 'center', color: '#3b82f6', marginBottom: 16 }}>{printingPO.po_number}</p>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: 12 }} />

            {/* Supplier */}
            <table style={{ width: '100%', fontSize: 11, marginBottom: 8 }}>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e293b', width: 80, padding: '2px 0' }}>Supplier:</td>
                <td style={{ color: '#64748b' }}>{printingPO.supplier_name}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e293b', width: 80, padding: '2px 0' }}>Date:</td>
                <td style={{ color: '#64748b' }}>{new Date(printingPO.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#1e293b', verticalAlign: 'top', padding: '2px 0' }}>Ship To:</td>
                <td style={{ color: '#64748b' }}>
                  Superare Fight Gear LLC<br />
                  Warehouse Fulfillment Center<br />
                  New York, NY 10001
                </td>
              </tr>
            </table>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: 10 }} />

            {/* Items */}
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Items Ordered</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '4px 6px', color: '#64748b', fontWeight: 600 }}>Product</th>
                  <th style={{ textAlign: 'left', padding: '4px 6px', color: '#64748b', fontWeight: 600 }}>Variant</th>
                  <th style={{ textAlign: 'center', padding: '4px 6px', color: '#64748b', fontWeight: 600 }}>Qty</th>
                  <th style={{ textAlign: 'center', padding: '4px 6px', color: '#64748b', fontWeight: 600 }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {(printingPO.items || []).map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '5px 6px', color: '#1e293b', fontWeight: 500 }}>{item.product_title || 'Unknown'}</td>
                    <td style={{ padding: '5px 6px', color: '#64748b' }}>{item.variant_title || '—'}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'center', color: '#1e293b', fontWeight: 600 }}>{item.qty || 0}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'center', color: '#64748b' }}>{item.current_stock ?? '?'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginTop: 6, marginBottom: 10 }} />

            {/* Notes */}
            {printingPO.notes && (
              <>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>Notes:</p>
                <p style={{ fontSize: 9, color: '#64748b', marginBottom: 12 }}>{printingPO.notes}</p>
              </>
            )}

            {/* Footer */}
            <p style={{ fontSize: 8, color: '#64748b', textAlign: 'center', marginTop: 20 }}>
              Generated by Superare Ops — {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {queue.length === 0 && draftPOs.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-100">
          <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Reorder queue is empty</p>
        </div>
      )}
    </div>
  )
}

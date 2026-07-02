import { useState, useEffect } from 'react'
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

  const selectAllZero = () => {
    const zeroIds = filtered.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'zero').map(i => i.variant_id + i.status)
    setSelected(prev => {
      const next = new Set(prev)
      for (const id of zeroIds) next.add(id)
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

  const downloadPDF = async (poId: string) => {
    setDownloadingPO(poId)
    try {
      const { data } = await supabase.from('purchase_orders').select('*').eq('id', poId).single()
      if (!data) return

      const resp = await fetch('/api/po-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ po: data }),
      })
      if (resp.ok) {
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `po-${data.po_number.toLowerCase()}.pdf`; a.click()
        URL.revokeObjectURL(url)
      } else {
        // Fallback: call the Node script via API or show error
        alert('PDF generation not available in browser. Use the server-side API route.')
      }
    } finally { setDownloadingPO(null) }
  }

  // Summary counts
  const zeroCount = queue.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'zero').length
  const criticalCount = queue.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'critical').length
  const lowCount = queue.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'low').length
  const warningCount = queue.filter(i => urgencyTier(i.urgency_score, i.current_qty, i.threshold_qty) === 'warning').length

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
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              Clear
            </button>
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
          <button onClick={selectAllZero}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-critical bg-critical/5 border border-critical/20 rounded-lg hover:bg-critical/10">
            <CheckSquare className="w-3.5 h-3.5" /> Select All Zero
          </button>
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
                  <button onClick={() => downloadPDF(po.id)} disabled={downloadingPO === po.id}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                    <Download className="w-3 h-3" />
                    {downloadingPO === po.id ? '...' : 'PDF'}
                  </button>
                </div>
              </div>
            ))}
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

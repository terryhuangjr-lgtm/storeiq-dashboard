import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ReorderQueueItem, PurchaseOrder } from '../lib/types'
import { Package, AlertCircle, AlertTriangle, ShoppingCart, Plus, FileText, ChevronDown, ChevronUp, CheckCircle, X, RefreshCw } from 'lucide-react'

const STORE_ID = '00000000-0000-0000-0000-000000000001'

export default function ReorderPage() {
  const [queue, setQueue] = useState<ReorderQueueItem[]>([])
  const [draftPOs, setDraftPOs] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToPO, setAddingToPO] = useState<string | null>(null)
  const [generatingPO, setGeneratingPO] = useState<string | null>(null)
  const [activePO, setActivePO] = useState<string | null>(null)
  const [showPOModal, setShowPOModal] = useState(false)
  const [poItems, setPoItems] = useState<ReorderQueueItem[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')

  const loadData = async () => {
    try {
      // Load pending reorder queue items
      const { data: queueData } = await supabase
        .from('reorder_queue')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('status', 'pending')
        .order('urgency_score', { ascending: false })

      if (queueData) setQueue(queueData as ReorderQueueItem[])

      // Load draft POs
      const { data: poData } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('store_id', STORE_ID)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })

      if (poData) setDraftPOs(poData as PurchaseOrder[])
    } catch (err) {
      console.error('Error loading reorder data:', err)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }

  useEffect(() => { loadData() }, [])

  // Severity badge
  const urgencyColor = (score: number) => {
    if (score >= 2) return 'critical'
    if (score >= 0.7) return 'high'
    return 'medium'
  }

  const urgencyLabel = (score: number) => {
    if (score >= 5) return 'CRITICAL'
    if (score >= 2) return 'LOW'
    if (score >= 0.7) return 'WARNING'
    return 'OK'
  }

  // Group items for PO builder
  const itemsBySupplier = queue.reduce<Record<string, ReorderQueueItem[]>>((acc, item) => {
    const s = item.supplier_name || 'Unknown Supplier'
    if (!acc[s]) acc[s] = []
    acc[s].push(item)
    return acc
  }, {})

  const availableSuppliers = Object.keys(itemsBySupplier).sort()

  // Add an item to the current PO selection
  const togglePOItem = (item: ReorderQueueItem) => {
    setPoItems(prev => {
      const exists = prev.find(p => p.variant_id === item.variant_id)
      if (exists) return prev.filter(p => p.variant_id !== item.variant_id)
      return [...prev, item]
    })
  }

  const isInPOSelection = (variantId: string) => poItems.some(p => p.variant_id === variantId)

  // Generate a PO from selected items
  const generatePO = async () => {
    if (poItems.length === 0) return

    const supplier = selectedSupplier || 'Mixed Supplier'
    const filteredItems = selectedSupplier
      ? poItems.filter(i => i.supplier_name === selectedSupplier)
      : poItems

    if (filteredItems.length === 0) return

    setGeneratingPO(supplier)
    try {
      // Generate PO number: PO-{STORE}-{YYYYMMDD}-{NNN}
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
      const { count } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true })
      const seq = ((count || 0) + 1).toString().padStart(3, '0')
      const poNumber = `PO-SUP-${dateStr}-${seq}`

      const poPayload = {
        store_id: STORE_ID,
        po_number: poNumber,
        supplier_name: supplier,
        status: 'draft',
        items: filteredItems.map(i => ({
          variant_id: i.variant_id,
          product_title: i.product_title,
          variant_title: i.variant_title,
          qty: i.suggested_reorder_qty,
          current_stock: i.current_qty,
        })),
        total_items: filteredItems.length,
        notes: `Generated from reorder queue — ${filteredItems.length} items`,
      }

      const { data: newPO, error } = await supabase
        .from('purchase_orders')
        .insert(poPayload)
        .select()
        .single()

      if (error) {
        console.error('Error creating PO:', error.message)
        return
      }

      // Mark items as added_to_po
      for (const item of filteredItems) {
        await supabase
          .from('reorder_queue')
          .update({ status: 'added_to_po' })
          .eq('store_id', STORE_ID)
          .eq('variant_id', item.variant_id)
          .eq('status', 'pending')
      }

      // Refresh
      setPoItems([])
      setSelectedSupplier('')
      setShowPOModal(false)
      await loadData()
    } catch (err: any) {
      console.error('Error generating PO:', err.message)
    } finally {
      setGeneratingPO(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📦 Reorder Queue</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {queue.length} item{queue.length !== 1 ? 's' : ''} below threshold
            {draftPOs.length > 0 && ` · ${draftPOs.length} draft PO${draftPOs.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {queue.length > 0 && (
            <button
              onClick={() => setShowPOModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New PO
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-critical/10 rounded-xl p-4 border border-critical/20">
          <p className="text-2xl font-bold text-critical tabular-nums">{queue.filter(i => i.urgency_score >= 5).length}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Critical</p>
        </div>
        <div className="bg-danger/10 rounded-xl p-4 border border-danger/20">
          <p className="text-2xl font-bold text-danger tabular-nums">{queue.filter(i => i.urgency_score >= 2 && i.urgency_score < 5).length}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Low</p>
        </div>
        <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
          <p className="text-2xl font-bold text-warning tabular-nums">{queue.filter(i => i.urgency_score >= 0.7 && i.urgency_score < 2).length}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Warning</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-700 tabular-nums">{draftPOs.length}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Draft POs</p>
        </div>
      </div>

      {/* Empty State */}
      {queue.length === 0 && draftPOs.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Reorder queue is empty</p>
          <p className="text-gray-400 text-sm mt-1">All stocked items are above their thresholds. Run the watchdog to refresh.</p>
        </div>
      )}

      {/* Active Reorder Queue */}
      {queue.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-3">
            <h2 className="text-lg font-bold text-gray-900">Items Below Threshold</h2>
            <p className="text-sm text-gray-400 mt-0.5">Sorted by urgency × lead time</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Threshold</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reorder</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Add to PO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {queue.map((item) => {
                  const color = urgencyColor(item.urgency_score)
                  return (
                    <tr key={item.variant_id + item.status} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          color === 'critical' ? 'bg-critical/10 text-critical' :
                          color === 'high' ? 'bg-danger/10 text-danger' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {item.urgency_score >= 5 ? <AlertCircle className="w-3.5 h-3.5" /> :
                           item.urgency_score >= 2 ? <AlertTriangle className="w-3.5 h-3.5" /> :
                           <AlertTriangle className="w-3.5 h-3.5" />}
                          {urgencyLabel(item.urgency_score)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{item.product_title}</div>
                        <div className="text-xs text-gray-400">{item.variant_title || 'Default'}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold text-lg ${item.current_qty <= 5 ? 'text-critical' : item.current_qty <= 10 ? 'text-danger' : 'text-gray-900'}`}>
                          {item.current_qty}
                        </span>
                        <div className="text-[10px] text-gray-400">units</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-gray-900">{item.threshold_qty}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-gray-900">{item.suggested_reorder_qty}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{item.supplier_name || '—'}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-gray-600">{item.lead_time_days}d</span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        {showPOModal ? (
                          <button
                            onClick={() => togglePOItem(item)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isInPOSelection(item.variant_id)
                                ? 'bg-primary/10 text-primary border border-primary/30'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                            }`}
                          >
                            {isInPOSelection(item.variant_id) ? (
                              <><CheckCircle className="w-3.5 h-3.5" /> Selected</>
                            ) : (
                              <><Plus className="w-3.5 h-3.5" /> Add</>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Open PO builder</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Draft POs */}
      {draftPOs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 pt-6 pb-3">
            <h2 className="text-lg font-bold text-gray-900">Draft Purchase Orders</h2>
            <p className="text-sm text-gray-400 mt-0.5">Pending POs ready for review</p>
          </div>
          <div className="space-y-3 p-6 pt-2">
            {draftPOs.map((po) => (
              <div key={po.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{po.po_number}</p>
                      <p className="text-xs text-gray-500">{po.supplier_name} · {po.total_items} item{po.total_items !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Draft
                  </span>
                </div>
                {activePO === po.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 text-xs font-semibold text-gray-500">Item</th>
                          <th className="text-center py-2 text-xs font-semibold text-gray-500">Qty</th>
                          <th className="text-center py-2 text-xs font-semibold text-gray-500">Current Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(po.items || []).map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2">
                              <span className="font-medium text-gray-800">{item.product_title}</span>
                              {item.variant_title && <span className="text-gray-400 ml-1">({item.variant_title})</span>}
                            </td>
                            <td className="py-2 text-center font-semibold">{item.qty}</td>
                            <td className="py-2 text-center text-gray-500">{item.current_stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3 text-xs text-gray-400">{po.notes}</div>
                  </div>
                )}
                <button
                  onClick={() => setActivePO(activePO === po.id ? null : po.id)}
                  className="mt-2 text-xs text-primary hover:text-primary/80 font-medium"
                >
                  {activePO === po.id ? 'Hide details' : 'View details'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PO Builder Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPOModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Create Purchase Order</h3>
              <div className="flex items-center gap-3">
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">All Suppliers</option>
                  {availableSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setShowPOModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-500 mb-2">
                Select items to add to PO · {poItems.length} selected
                {selectedSupplier && ` · filtered by ${selectedSupplier}`}
              </p>

              {queue
                .filter(i => !selectedSupplier || i.supplier_name === selectedSupplier)
                .map((item) => (
                  <div
                    key={item.variant_id}
                    onClick={() => togglePOItem(item)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                      isInPOSelection(item.variant_id)
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        isInPOSelection(item.variant_id) ? 'border-primary bg-primary text-white' : 'border-gray-300'
                      }`}>
                        {isInPOSelection(item.variant_id) && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.product_title}</p>
                        <p className="text-xs text-gray-400">{item.variant_title || 'Default'} · Supplier: {item.supplier_name || '—'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">Order {item.suggested_reorder_qty}</p>
                      <p className="text-xs text-gray-400">{item.current_qty} in stock</p>
                    </div>
                  </div>
                ))}

              {queue.filter(i => !selectedSupplier || i.supplier_name === selectedSupplier).length === 0 && (
                <p className="text-center text-gray-400 py-8">No items match the selected supplier filter</p>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-2xl flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{poItems.length}</span> item{poItems.length !== 1 ? 's' : ''} selected
                {poItems.length > 0 && (
                  <span> · Supplier: {selectedSupplier || 'Mixed'}</span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setPoItems([]); setSelectedSupplier('') }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={generatePO}
                  disabled={poItems.length === 0 || generatingPO !== null}
                  className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {generatingPO ? 'Generating...' : `Generate PO (${poItems.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

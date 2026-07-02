import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ReorderThreshold, InventoryVariant } from '../lib/types'
import { Save, Package, Search, ChevronDown, ChevronUp, CheckCircle, Plus, X } from 'lucide-react'

const STORE_ID = '00000000-0000-0000-0000-000000000001'

export default function ThresholdSettings() {
  const [variants, setVariants] = useState<InventoryVariant[]>([])
  const [thresholds, setThresholds] = useState<Record<string, Partial<ReorderThreshold>>>({})
  const [savedThresholds, setSavedThresholds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [showPrepopModal, setShowPrepopModal] = useState(false)

  // Load variants and saved thresholds
  useEffect(() => {
    const load = async () => {
      try {
        // Get all variants from inventory map
        const { data: variantData } = await supabase
          .from('superare_inventory_map')
          .select('inventory_item_id, product_title, variant_title, variant_id')
          .not('variant_id', 'is', null)
          .order('product_title')

        if (variantData) {
          setVariants(variantData as InventoryVariant[])
          // Expand all products by default
          const productNames = new Set(variantData.map((v: InventoryVariant) => v.product_title))
          setExpandedProducts(new Set(productNames))
        }

        // Get saved thresholds
        const { data: thresholdData } = await supabase
          .from('reorder_thresholds')
          .select('*')
          .eq('store_id', STORE_ID)

        if (thresholdData) {
          const thresholdMap: Record<string, Partial<ReorderThreshold>> = {}
          const savedIds = new Set<string>()
          for (const t of thresholdData as ReorderThreshold[]) {
            thresholdMap[t.variant_id] = t
            savedIds.add(t.variant_id)
          }
          setThresholds(thresholdMap)
          setSavedThresholds(savedIds)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Group variants by product
  const groupedVariants = variants.reduce<Record<string, InventoryVariant[]>>((acc, v) => {
    if (!acc[v.product_title]) acc[v.product_title] = []
    acc[v.product_title].push(v)
    return acc
  }, {})

  // Filter by search
  const filteredProducts = Object.entries(groupedVariants).filter(([productName, variants]) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      productName.toLowerCase().includes(q) ||
      variants.some(v => v.variant_title?.toLowerCase().includes(q))
    )
  })

  const toggleProduct = (name: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const updateThreshold = (variantId: string, field: string, value: any) => {
    setThresholds(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: value,
        variant_id: variantId,
        store_id: STORE_ID,
      }
    }))
  }

  const saveThreshold = async (variantId: string) => {
    const t = thresholds[variantId]
    if (!t || !t.product_title) return

    setSaving(prev => new Set(prev).add(variantId))
    try {
      const payload = {
        store_id: STORE_ID,
        variant_id: variantId,
        product_title: t.product_title || '',
        variant_title: t.variant_title || null,
        threshold_qty: t.threshold_qty ?? 10,
        suggested_reorder_qty: t.suggested_reorder_qty ?? 25,
        supplier_name: t.supplier_name || '',
        lead_time_days: t.lead_time_days ?? 7,
        is_active: true,
      }

      // Upsert
      const { error } = await supabase
        .from('reorder_thresholds')
        .upsert(payload, { onConflict: 'store_id,variant_id' })

      if (error) {
        console.error('Error saving threshold:', error.message)
        return
      }

      setSavedThresholds(prev => new Set(prev).add(variantId))
    } catch (err: any) {
      console.error('Error saving:', err.message)
    } finally {
      setSaving(prev => {
        const next = new Set(prev)
        next.delete(variantId)
        return next
      })
    }
  }

  const prepopulateDefaults = async () => {
    setShowPrepopModal(false)
    // Prepopulate thresholds for top products with sensible defaults
    const defaultThresholds: Array<{ product: string; threshold: number; reorder: number; supplier: string; leadTime: number }> = [
      { product: 'Supergel V Boxing Gloves', threshold: 5, reorder: 20, supplier: 'Venum (Direct)', leadTime: 14 },
      { product: 'Superare Finisher Hoodie', threshold: 10, reorder: 30, supplier: 'Gildan Activewear', leadTime: 7 },
      { product: 'Supergel Pro Gloves', threshold: 5, reorder: 20, supplier: 'Venum (Direct)', leadTime: 14 },
      { product: 'World Champion Tee', threshold: 15, reorder: 50, supplier: 'Gildan Activewear', leadTime: 7 },
      { product: 'S40 Italian Leather Lace Up Gloves', threshold: 3, reorder: 10, supplier: 'Deer Supreme LLC', leadTime: 21 },
    ]

    for (const def of defaultThresholds) {
      const productVariants = variants.filter(v => v.product_title === def.product)
      for (const v of productVariants) {
        updateThreshold(v.variant_id, 'product_title', v.product_title)
        updateThreshold(v.variant_id, 'variant_title', v.variant_title)
        updateThreshold(v.variant_id, 'threshold_qty', def.threshold)
        updateThreshold(v.variant_id, 'suggested_reorder_qty', def.reorder)
        updateThreshold(v.variant_id, 'supplier_name', def.supplier)
        updateThreshold(v.variant_id, 'lead_time_days', def.leadTime)
        // Auto-save
        await new Promise(r => setTimeout(r, 200))
        await saveThreshold(v.variant_id)
      }
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
          <h1 className="text-2xl font-bold text-gray-900">Reorder Thresholds</h1>
          <p className="text-gray-500 mt-1 text-sm">Set inventory thresholds, reorder quantities, and supplier info per variant</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPrepopModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Pre-Populate
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Pre-populate modal */}
      {showPrepopModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPrepopModal(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pre-Populate Thresholds</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will set threshold values for 5 key products with sensible defaults:
            </p>
            <ul className="space-y-1.5 mb-4 text-sm text-gray-700">
              <li className="flex items-center gap-2">• Supergel V Gloves (threshold: 5, reorder: 20)</li>
              <li className="flex items-center gap-2">• Superare Finisher Hoodie (threshold: 10, reorder: 30)</li>
              <li className="flex items-center gap-2">• Supergel Pro Gloves (threshold: 5, reorder: 20)</li>
              <li className="flex items-center gap-2">• World Champion Tee (threshold: 15, reorder: 50)</li>
              <li className="flex items-center gap-2">• S40 Italian Leather Lace Up Gloves (threshold: 3, reorder: 10)</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowPrepopModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
              <button onClick={prepopulateDefaults} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Thresholds by Product */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {filteredProducts.map(([productName, productVariants]) => {
        const isExpanded = expandedProducts.has(productName)
        const configuredCount = productVariants.filter(v => savedThresholds.has(v.variant_id)).length

        return (
          <div key={productName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Product header */}
            <button
              onClick={() => toggleProduct(productName)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${configuredCount > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                  <Package className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{productName}</h3>
                  <p className="text-xs text-gray-400">{productVariants.length} variants · {configuredCount} configured</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {configuredCount === productVariants.length && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> All Set
                  </span>
                )}
                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </button>

            {/* Variant rows */}
            {isExpanded && (
              <div className="overflow-x-auto border-t border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Variant</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Threshold Qty</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reorder Qty</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Time (Days)</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productVariants.map((v) => {
                      const t = thresholds[v.variant_id] || {}
                      const isSaving = saving.has(v.variant_id)
                      const isSaved = savedThresholds.has(v.variant_id)

                      return (
                        <tr key={v.variant_id} className={`hover:bg-gray-50 transition-colors ${isSaved ? 'bg-green-50/30' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {v.variant_title || 'Default'}
                              </span>
                              {isSaved && (
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {v.variant_id.slice(-8)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              value={t.threshold_qty ?? ''}
                              onChange={(e) => {
                                updateThreshold(v.variant_id, 'product_title', v.product_title)
                                updateThreshold(v.variant_id, 'variant_title', v.variant_title)
                                updateThreshold(v.variant_id, 'threshold_qty', parseInt(e.target.value) || 0)
                              }}
                              className="w-20 text-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="10"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              value={t.suggested_reorder_qty ?? ''}
                              onChange={(e) => {
                                updateThreshold(v.variant_id, 'product_title', v.product_title)
                                updateThreshold(v.variant_id, 'variant_title', v.variant_title)
                                updateThreshold(v.variant_id, 'suggested_reorder_qty', parseInt(e.target.value) || 0)
                              }}
                              className="w-20 text-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="25"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="text"
                              value={t.supplier_name ?? ''}
                              onChange={(e) => {
                                updateThreshold(v.variant_id, 'product_title', v.product_title)
                                updateThreshold(v.variant_id, 'variant_title', v.variant_title)
                                updateThreshold(v.variant_id, 'supplier_name', e.target.value)
                              }}
                              className="w-40 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="Supplier name"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              value={t.lead_time_days ?? ''}
                              onChange={(e) => {
                                updateThreshold(v.variant_id, 'product_title', v.product_title)
                                updateThreshold(v.variant_id, 'variant_title', v.variant_title)
                                updateThreshold(v.variant_id, 'lead_time_days', parseInt(e.target.value) || 0)
                              }}
                              className="w-20 text-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              placeholder="7"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => saveThreshold(v.variant_id)}
                              disabled={isSaving}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                                isSaved
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                  : 'bg-primary text-white hover:bg-primary/90'
                              } disabled:opacity-50`}
                            >
                              <Save className="w-3.5 h-3.5" />
                              {isSaving ? 'Saving...' : isSaved ? 'Updated' : 'Save'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

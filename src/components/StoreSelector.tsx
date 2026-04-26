import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export default function StoreSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const stores = [
    { id: '1', name: 'Superare' },
    { id: '2', name: 'Boutique Plus' },
    { id: '3', name: 'Fashion Hub' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/10 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors"
      >
        <span>Superare</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg py-1 z-10">
          {stores.map((store) => (
            <button
              key={store.id}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Check className="w-4 h-4 text-primary" />
              <span>{store.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
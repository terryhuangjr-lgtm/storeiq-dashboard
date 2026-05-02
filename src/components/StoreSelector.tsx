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
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white text-sm font-medium transition-all duration-200"
      >
        <span className="truncate">Superare</span>
        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl shadow-black/10 border border-gray-100 py-1 z-20 overflow-hidden">
            {stores.map((store, i) => (
              <button
                key={store.id}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors ${i === 0 ? 'bg-primary/5 text-primary font-medium' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${i === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Check className="w-3 h-3" />
                </div>
                <span>{store.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
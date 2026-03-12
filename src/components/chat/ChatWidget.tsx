import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatPanel } from './ChatPanel';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel (slides up from the button) */}
      {isOpen && (
        <div
          className="w-96 h-[520px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col bg-white"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          <ChatPanel />
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-800'
            : 'bg-green-600 hover:bg-green-700'
        } text-white`}
        title={isOpen ? 'Close compliance assistant' : 'Open compliance assistant'}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

import { LogOut } from 'lucide-react';

type HeaderProps = {
  email?: string;
  onSignOut: () => void;
};

export function Header({ email, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">Farm MRL Portal</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-gray-600 truncate max-w-56">{email}</span>
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
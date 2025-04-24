import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  LinkIcon,
  LayoutDashboard,  
  Activity,
  ExternalLink,
} from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-black text-gray-100 relative">
      {/* Content */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/80 border-r border-gray-800/50 flex flex-col backdrop-blur-sm">
          {/* Logo */}
          <div className="p-5 border-b border-gray-800/50">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                <LinkIcon size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight">LinkVault</h1>
                <p className="text-xs text-white">Link Management System</p>
              </div>
            </div>
          </div>

          {/* User profile */}
          <div className="p-4 border-b border-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-md">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">GIS</h3>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors duration-200">
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">Main Menu</p>
            <ul className="space-y-2">
              <li>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-900/50 to-purple-900/50 text-white border border-purple-800/30 shadow-md shadow-purple-900/10 hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300">
                  <LayoutDashboard size={18} className="text-cyan-400" />
                  <span className="font-medium">Dashboard</span>
                </button>
              </li>
              <li>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/70 hover:text-white hover:shadow-md hover:shadow-purple-900/5 hover:border hover:border-gray-700/50 transition-all duration-300">
                  <LinkIcon size={18} className="text-gray-500 group-hover:text-cyan-400" />
                  <span>View Links</span>
                </button>
              </li>
              <li>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/70 hover:text-white hover:shadow-md hover:shadow-purple-900/5 hover:border hover:border-gray-700/50 transition-all duration-300">
                  <ExternalLink size={18} className="text-gray-500 group-hover:text-cyan-400" />
                  <span>Manage Links</span>
                </button>
              </li>
              <li>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/70 hover:text-white hover:shadow-md hover:shadow-purple-900/5 hover:border hover:border-gray-700/50 transition-all duration-300">
                  <Settings size={18} className="text-gray-500 group-hover:text-cyan-400" />
                  <span>Settings</span>
                </button>
              </li>
            </ul>

            <div className="mt-8">
              <p className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">Account</p>
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/70 hover:text-white hover:shadow-md hover:shadow-purple-900/5 hover:border hover:border-gray-700/50 transition-all duration-300">
                <LogOut size={18} className="text-gray-500 group-hover:text-cyan-400" />
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800/50">
            <p className="text-xs text-gray-500">LinkVault v2.0.4</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-gray-800/50 flex items-center justify-between px-6 bg-gray-900/30 backdrop-blur-md">
            <button className="lg:hidden text-gray-400 hover:text-white transition-colors duration-200">
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-black"></span>
              </button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
                  <LayoutDashboard size={26} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Welcome back, GIS
                  </h1>
                  <p className="text-gray-400">Here's what's happening with your links today.</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-purple-900/10 hover:border-gray-700/70 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Total Links</h3>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors duration-300">
                      <LinkIcon size={18} className="text-cyan-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">1,257</p>
                  <div className="flex items-center mt-2 text-xs text-green-500">
                    <Activity size={14} className="mr-1" />
                    <span>↑ 12% from last month</span>
                  </div>
                </div>

                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-purple-900/10 hover:border-gray-700/70 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Active Links</h3>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-300">
                      <LinkIcon size={18} className="text-purple-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">1,180</p>
                  <div className="flex items-center mt-2 text-xs text-green-500">
                    <Activity size={14} className="mr-1" />
                    <span>↑ 8% from last month</span>
                  </div>
                </div>

                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6 shadow-lg hover:shadow-xl hover:shadow-purple-900/10 hover:border-gray-700/70 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Total Clicks</h3>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors duration-300">
                      <ExternalLink size={18} className="text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">24.3K</p>
                  <div className="flex items-center mt-2 text-xs text-green-500">
                    <Activity size={14} className="mr-1" />
                    <span>↑ 18% from last month</span>
                  </div>
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300">
                <div className="p-5 border-b border-gray-800/50 flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Recent Activity</h2>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                    View All
                  </button>
                </div>
                <div className="p-5">
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group cursor-pointer border border-transparent hover:border-gray-700/50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-colors duration-300">
                          <LinkIcon size={18} className="text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium group-hover:text-white transition-colors duration-200">
                            New link created
                          </h4>
                          <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-200">
                            https://example.com/product-launch
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-200">
                            2 minutes ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 
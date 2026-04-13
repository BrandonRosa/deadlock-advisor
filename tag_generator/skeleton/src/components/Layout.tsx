// ============================================================
// src/components/Layout.tsx  —  MODULE 4
// The app shell: fixed sidebar with nav links + main content area.
// All pages render inside the <Outlet /> (React Router replaces
// Outlet with whatever child route matched the URL).
//
// REACT ROUTER CONCEPTS:
//   NavLink = like Link but adds an "active" class when its route matches
//   Outlet  = placeholder where child routes render (like a viewport)
// ============================================================

// TODO: import NavLink, Outlet from 'react-router-dom'
// TODO: import useDataStore from '../store/dataStore'

// Navigation items for the sidebar
const navItems = [
  { to: '/',         label: 'Calculator' },
  { to: '/heroes',   label: 'Heroes' },
  { to: '/items',    label: 'Items' },
  { to: '/tags',     label: 'Tags' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout() {
  // TODO: Read the current mode from the store
  // HINT: useDataStore(state => state.mode)

  return (
    <div className="flex min-h-screen bg-slate-950">

      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-slate-900 border-r border-slate-800 fixed top-0 left-0 h-full flex flex-col">

        {/* App title + mode badge */}
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-white font-bold text-sm">Deadlock Advisor</h1>
          {/* TODO: Show a small badge indicating the current mode
              Use different colors: violet for 'custom', slate for 'defaults'
              HINT: template literal for dynamic className:
                className={`... ${mode === 'custom' ? 'bg-violet-900 ...' : 'bg-slate-800 ...'}`} */}
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-2">
          {/* TODO: Map over navItems and render a <NavLink> for each one
              HINT: NavLink's className prop can be a function:
                className={({ isActive }) => isActive ? 'active-styles' : 'inactive-styles'}
              HINT: Add  end={item.to === '/'}  to the Calculator link so it only
                    highlights when exactly on "/" and not on "/heroes" etc. */}
        </nav>
      </aside>

      {/* ── MAIN CONTENT — pages render here ── */}
      <main className="ml-56 flex-1 p-6 text-slate-200">
        {/* TODO: Render <Outlet /> here */}
      </main>
    </div>
  );
}

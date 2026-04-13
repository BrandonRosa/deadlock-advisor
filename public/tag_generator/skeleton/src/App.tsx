// ============================================================
// src/App.tsx  —  MODULE 4
// Sets up client-side routing with React Router.
//
// WHY HashRouter instead of BrowserRouter?
//   GitHub Pages only serves static files. If the user hard-refreshes
//   on a URL like /heroes/abrams, GitHub serves a 404 because there
//   is no actual file there. HashRouter puts the path after a #:
//     YOUR_GITHUB_USERNAME.github.io/deadlock-advisor/#/heroes/abrams
//   The browser never sends the # part to the server, so it always
//   loads index.html and React handles the routing.
// ============================================================

// TODO: import HashRouter, Routes, Route from 'react-router-dom'
// TODO: import Layout from './components/Layout'
// TODO: import all page components:
//   CalculatorPage, HeroesPage, HeroDetailPage,
//   ItemsPage, ItemDetailPage, TagsPage, SettingsPage

export default function App() {
  return (
    // TODO: Wrap everything in <HashRouter>
    //
    // ROUTE STRUCTURE:
    //   The Layout component wraps all pages (shared nav sidebar).
    //   Use a "layout route":
    //     <Route path="/" element={<Layout />}>
    //       <Route index element={<CalculatorPage />} />      ← matches "/"
    //       <Route path="heroes" element={<HeroesPage />} />  ← matches "/heroes"
    //       <Route path="heroes/:name" element={<HeroDetailPage />} />
    //       <Route path="items"        element={<ItemsPage />} />
    //       <Route path="items/:name"  element={<ItemDetailPage />} />
    //       <Route path="tags"         element={<TagsPage />} />
    //       <Route path="settings"     element={<SettingsPage />} />
    //     </Route>
    //
    // HINT: "index" means this route matches the parent path exactly ("/")
    // HINT: ":name" is a URL parameter — read it in the page with useParams()

    <div>TODO: replace this with HashRouter + Routes</div>
  );
}

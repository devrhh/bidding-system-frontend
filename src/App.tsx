import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { routes } from "./routes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {routes.map((route, idx) => (
              <Route key={idx} path={route.path} element={route.element} />
            ))}
          </Routes>
        </Suspense>
      </Router>
     </>
  )
}

export default App

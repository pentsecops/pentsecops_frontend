
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  // // Disable right-click context menu
  // document.addEventListener('contextmenu', (e) => {
  //   e.preventDefault();
  // });

  // Disable text selection via keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Disable Ctrl+A (Select All)
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
    }
  });

  createRoot(document.getElementById("root")!).render(<App />);
  
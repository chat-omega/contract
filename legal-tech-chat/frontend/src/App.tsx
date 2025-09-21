import { Chat } from "./components/chat"

import "./App.css"
import { ThemeProvider } from "./components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="mx-auto h-full max-w-4xl p-4">
        <Chat />
      </div>
    </ThemeProvider>
  )
}

export default App

import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { ChatbotPage } from "./components/chatbotPage";

function App() {
  return (
    <div className="App w-100 h-100">
      <ChatbotPage />
    </div>
  );
}

export default App;

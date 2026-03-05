import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PqrForm from "./components/PqrForm";

function App() {

  return (
    <BrowserRouter>

      <PqrForm />

    </BrowserRouter >
  );

}

export default App;
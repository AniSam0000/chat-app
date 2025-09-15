import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContextProvider.js";

// click rafce for auto complete

const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain ">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
        ></Route>
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        ></Route>
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
        ></Route>
      </Routes>
    </div>
  );
};

export default App;

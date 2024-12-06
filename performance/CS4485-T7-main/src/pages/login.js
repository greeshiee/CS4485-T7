import Navbar from "../components/header";
import LoginPage from "../components/loginpage";

export default function Login() {
  return (
    <>
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <Navbar/>
      <LoginPage />
    </>
  );
}


import { useState, useEffect } from "react";
import { Button } from "../shadcn/button";
import { UserRound, Logs, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../img/logoDefinitivo.webp";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenu1Open, setIsMenu1Open] = useState(false);
  const [user, setUser] = useState("");
  const [rol, setRol] = useState("");
  const [fieldsNav, setFieldsNav] = useState([]);
  const [selectedButton, setSelectedButton] = useState(null); // Estado para el botón seleccionado del segundo navbar
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = () => {
      const storedUser = localStorage.getItem("user");
      const storedRol = localStorage.getItem("rol");

      if (storedUser && storedRol) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const parsedRol = JSON.parse(storedRol);

          setUser(parsedUser);
          setRol(parsedRol);

          if (parsedRol === "admin") {
            setFieldsNav([
              { name: "HOME", path: "/HomeAdmin" },
              { name: "USUARIOS", path: "/Users" },
              { name: "OT ASIGNADAS", path: "/OTasign" },
              { name: "PARAMETROS", path: "/Params" },
              { name: "SERVICIOS", path: "/nodos" },
            ]);
          } else if (parsedRol === "usuario") {
            setFieldsNav([{ name: "HOME", path: "/OTasignUsers" }]);
          }
        } catch (error) {
          console.error("Error parsing authentication data:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("rol");
        }
      } else {
        setUser(null);
        setRol(null);
        setFieldsNav([]);
      }
    };

    checkAuthentication();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMenu1 = () => {
    setIsMenu1Open(!isMenu1Open);
  };

  const handleNavigationFirstNavbar = (path) => {
    navigate(path);
    // No afecta el estado del segundo navbar
  };

  const handleNavigationSecondNavbar = (path, index) => {
    navigate(path);
    setSelectedButton(index); // Establecer el botón seleccionado del segundo navbar
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("rol");
    setUser(null);
    setRol(null);
    navigate("/");
  };

  return (
    <div className="">
      {/* Primer Navbar sin el nuevo estilo */}
      <div className="gap-12 outline border-b-2 ">
        <div className="hidden sm:flex flex-row justify-end ">
          {["SAT", "TDB", "VARIADORES", "CONTROL DE HORAS"].map((label) => (
            <Button
              key={label}
              onClick={() => handleNavigationFirstNavbar(label)} // Llama a la función de navegación del primer navbar
              variant="ghost"
              className="text-black text-sm font-medium !no-underline hover:text-black hover:font-bold hover:scale-105 transition-transform transition-colors duration-700 ease-in-out"
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="sm:hidden flex items-end justify-end mr-1">
          <Button
            onClick={toggleMenu1}
            variant="link"
            className="text-black text-sm"
          >
            {isMenu1Open ? <Logs /> : <Logs />}
          </Button>
        </div>
        {isMenu1Open && (
          <div className="sm:hidden flex flex-col justify-end items-center gap-2 bg-white shadow-lg rounded-md z-0">
            {["SAT", "TDB", "VARIADORES", "CONTROL DE HORAS"].map((label) => (
              <Button
                key={label}
                onClick={() => handleNavigationFirstNavbar(label)} // Llama a la función de navegación del primer navbar
                variant="ghost"
                className="text-black text-sm font-medium !no-underline hover:text-black hover:font-bold hover:scale-105 transition-transform transition-colors duration-700 ease-in-out"
              >
                {label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Segundo Navbar con el nuevo estilo */}
      <div className="relative flex flex-row z-50 w-full h-20 bg-white text-lg items-end justify-between px-1 shadow-2xl transition-all order-first">
        <div className="flex items-center">
          <img
            className="h-full w-20 transition-transform duration-500 ease-in-out hover:rotate-[360deg]"
            src={logo}
            alt="Logo"
          />
          <p className="text-lg ml-2 font-medium truncate w-32 sm:w-auto">
            {!isMenuOpen && user.charAt(0).toUpperCase() + user.slice(1)}
          </p>
        </div>
        <div className="hidden sm:flex space-x-1">
          {user && rol && (
            <>
              {fieldsNav.map((item, index) => (
                <Button
                  key={index}
                  variant="link"
                  className={`text-black text-sm !no-underline transition-transform transition-colors duration-700 ease-in-out relative pb-10`}
                  onClick={() => handleNavigationSecondNavbar(item.path, index)} // Llama a la función de navegación del segundo navbar
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-1 bg-sky-950 transform ${selectedButton === index ? "scale-x-100" : "scale-x-0"
                      } transition-transform duration-200 ease-in-out`}
                  />
                </Button>
              ))}
              <Button
                onClick={handleLogout}
                variant="link"
                className="text-black text-sm pb-10"
              >
                <LogOut />
              </Button>
            </>
          )}
        </div>
        <div className="sm:hidden flex items-center">
          <Button
            onClick={toggleMenu}
            variant="link"
            className="text-black text-sm pb-10"
          >
            {isMenuOpen ? <Logs /> : <Logs />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden bg-white shadow-lg py-4 px-6">
          {user && rol && (
            <div className="flex flex-col mt-4">
              <div className="flex flex-row space-x-4 border items-center justify-center h-20">
                <UserRound size={32} />
                <div className="flex flex-col">
                  <p className="text-lg text-black">
                    {user.charAt(0).toUpperCase() + user.slice(1)}
                  </p>
                  <p className="text-lg text-black">
                    {rol.charAt(0).toUpperCase() + rol.slice(1)}
                  </p>
                </div>
              </div>
              {fieldsNav.map((item, index) => (
                <Button
                  key={index}
                  variant="link"
                  className="text-black text-sm !no-underline hover:text-black hover:font-bold hover:scale-105 hover:border"
                  onClick={() => handleNavigationSecondNavbar(item.path)} // Llama a la función de navegación del segundo navbar
                >
                  {item.name}
                </Button>
              ))}
              <Button
                onClick={handleLogout}
                variant="link"
                className="text-black text-sm mt-2 w-full"
              >
                <LogOut />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;

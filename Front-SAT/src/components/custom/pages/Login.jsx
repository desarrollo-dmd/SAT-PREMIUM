import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileForm } from "../forms/FormLogin";
import { RedesHover } from "../RedesHover";
import { Card, CardContent, CardFooter, CardHeader } from "../../shadcn/card";
import { LoadingSpinner } from "../Spinner";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import logo from "../../../img/logoDefinitivo.webp";
import { useAxiosInstance } from "../../../axiosInstance";
import CustomToast from '../CustomToast';
import { useToast } from '../../../hooks/use-toast';
import { schemaLogin } from "../../../schemas/validationSchemas";

/**
 * Componente de inicio de sesión.
 * 
 * Este componente gestiona la lógica de inicio de sesión de los usuarios.
 * Utiliza un formulario para capturar el nombre de usuario y la contraseña.
 * Al enviar el formulario, se realiza una solicitud POST a la API para verificar
 * las credenciales del usuario. Si la autenticación es exitosa, se almacenan
 * los datos del usuario y el token de autenticación en el almacenamiento local,
 * y el usuario es redirigido a la página correspondiente según su rol (admin o usuario).
 * 
 * También maneja el estado de carga y muestra un spinner mientras se procesa
 * la solicitud, así como notificaciones de éxito o error mediante un sistema de
 * toast.
 * 
 * @returns {JSX.Element} El componente de inicio de sesión.
 */
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showToast } = useToast();
  const navigate = useNavigate();
  const axiosInstance = useAxiosInstance();

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * 
   * Esta función se ejecuta al enviar el formulario, gestionando la autenticación del usuario.
   * Realiza una solicitud POST a la API con el nombre de usuario y la contraseña proporcionados.
   * Si la autenticación es exitosa, almacena el token y la información del usuario en el almacenamiento local
   * y redirige al usuario a la página correspondiente según su rol (admin o usuario).
   * También maneja los errores, mostrando mensajes de error a través de un sistema de notificación.
   * 
   * @param {Object} values - Valores del formulario que contienen 'username' y 'password'.
   */
  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(`/usuarios/iniciarSesion`, {
        usuario: values.username,
        password: values.password,
      });
      const { token, usuario, rol } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(usuario));
      localStorage.setItem("rol", JSON.stringify(rol));

      if (rol === "admin") {
        navigate("/HomeAdmin");
      } else if (rol === "usuario") {
        localStorage.removeItem('formularios');
        navigate("/OTasignUsers");
      } else {
        navigate("/");
      }

      showToast('Inicio de sesión exitoso.', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || `${error}'}`;
      showToast(`Error: ${errorMessage}`, 'error');
      console.error(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-12 px-4 md:px-0 h-screen">
      <CustomToast message={toast.message} type={toast.type} />

      <Card className="w-full max-w-96 max-h-full shadow-2xl">
        <CardHeader className="w-full">
          <a
            href="https://www.solucionesdmd.com/"
            className="h-full w-full flex justify-center"
          >
            <img
              src={logo}
              alt="iconodmd"
              className="h-24 w-auto md:h-1/2 md:w-3/4 max-w-44"
            />
          </a>
        </CardHeader>
        <CardContent className="px-4 md:px-10">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="3rem" className="w-8 h-8 text-blue-600" />
            </div>
          ) : (
            <ProfileForm iOnSubmit={onSubmit} iFormSchema={schemaLogin} />
          )}
        </CardContent>
        <CardFooter className="flex md:flex-row justify-center items-center md:space-x-0 mt-4 md:mt-0">
          <RedesHover
            link={"https://www.instagram.com/dmdcompresores/"}
            texto={"Encontranos en nuestro instagram oficial!"}
            imgsrc={"src/img/logoDefinitivo.webp"}
          >
            <Instagram />
          </RedesHover>
          <RedesHover
            link={"https://www.facebook.com/DMDCOMPRESORES"}
            texto={"Encontranos también en Facebook!"}
            imgsrc={"src/img/logoDefinitivo.webp"}
          >
            <Facebook />
          </RedesHover>
          <RedesHover
            link={"https://www.linkedin.com/company/dmd-compresores"}
            texto={"Entérate de las últimas novedades en nuestro LinkedIn!"}
            imgsrc={"src/img/logoDefinitivo.webp"}
          >
            <Linkedin />
          </RedesHover>
        </CardFooter>
      </Card>
    </div>
  );
};

export { Login };

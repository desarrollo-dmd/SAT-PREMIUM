import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../shadcn/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../../shadcn/form";
import { Input } from "../../shadcn/input";

/**
 * Componente para el formulario de perfil de usuario.
 * 
 * Este componente permite a los usuarios ingresar su nombre de usuario 
 * y contraseña. Utiliza react-hook-form para manejar la validación y el 
 * envío del formulario, junto con Zod para la validación de esquemas.
 * 
 * Props:
 * @param {Function} iOnSubmit - Función que se ejecuta al enviar el formulario.
 * @param {Object} iFormSchema - Esquema de validación de Zod para el formulario.
 * 
 * Contiene:
 * - Un campo para el nombre de usuario que convierte su valor a minúsculas.
 * - Un campo para la contraseña.
 * - Un botón para enviar el formulario.
 */
export function ProfileForm({ iOnSubmit, iFormSchema }) {
  const form = useForm({
    resolver: zodResolver(iFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  /**
   * Maneja el evento de cambio en un input, convirtiendo su valor a minúsculas.
   * 
   * Esta función:
   * 1. Obtiene el valor actual del input.
   * 2. Convierte el valor a minúsculas.
   * 3. Asigna el valor convertido nuevamente al input, asegurando que 
   *    solo se guarde en minúsculas.
   *
   * @param {Event} e - El evento de cambio del input.
   */
  const handleChange = (e) => {
    const lowerCaseValue = e.target.value.toLowerCase();
    e.target.value = lowerCaseValue;
  }
  return (
    <Form {...form} className="mt-8">
      <form onSubmit={form.handleSubmit(iOnSubmit)} className="space-y-4 ">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Usuario" {...field} onChange={(e) => {
                  handleChange(e);
                  field.onChange(e);
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  className="my-4"
                  type="password"
                  placeholder="Contraseña"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Por favor, ingrese sus credenciales.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          {" "}
          <Button type="submit" className="bg-sky-900 hover:bg-sky-950 mt-4">
            Iniciar sesión
          </Button>
        </div>
      </form>
    </Form>
  );
}

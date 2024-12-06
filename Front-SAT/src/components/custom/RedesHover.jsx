import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import { Button } from "../shadcn/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../shadcn/hover-card";

/**
 * Componente RedesHover.
 *
 * Este componente presenta una tarjeta de información que aparece al pasar el 
 * cursor sobre un enlace. Contiene un enlace que actúa como disparador, 
 * abriendo un nuevo enlace en una pestaña separada. Al hacer hover, muestra 
 * un contenido que incluye un avatar y un texto descriptivo. Este diseño 
 * permite a los usuarios ver información adicional sobre un perfil 
 * o un enlace, mejorando la interactividad y la experiencia de usuario.
 */
const RedesHover = ({ link, texto, imgsrc, children }) => {
  return (
    <HoverCard>
      {/* Aquí utilizamos el enlace directamente como trigger */}
      <HoverCardTrigger asChild>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <Button variant="link" className="text-base font-semibold">
            {children}
          </Button>
        </a>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex text-wrap space-x-1 items-center">
          <div className="h-full">
            <Avatar className="text-start m-1 ">
              <AvatarImage src={imgsrc} />
              <AvatarFallback>AvatarDMD</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-left space-y-1.5 my-0.5">
            <h2 className="text-base font-semibold">@DMDcompresores</h2>
            <p>{texto}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export { RedesHover };

import { z } from 'zod';

const createSchema = ({ nombreMin, potenciaMin, potenciaMax, modeloMin, funcionaDefault = undefined, fechaNullable = false }) => {
  return z.object({
    nombre: z.string().min(nombreMin, `Mínimo ${nombreMin} ${nombreMin > 1 ? 'caracteres' : 'carácter'}`),
    potencia: z.preprocess(val => Number(val), z.number().int("Debe ser un número entero").min(potenciaMin, `Debe ser al menos ${potenciaMin}`).max(potenciaMax, `Debe ser como máximo ${potenciaMax}`)),
    modelo: modeloMin ? z.string().min(modeloMin, `Mínimo ${modeloMin} caracteres`) : z.string().optional(),
    funciona: z.preprocess(val => val === 'true', z.boolean()).optional().default(funcionaDefault),
    fecha_de_visita: z.preprocess(val => val ? new Date(val) : (fechaNullable ? null : undefined), fechaNullable ? z.date().nullable() : z.date().optional()),
  });
};

export const schemaA = createSchema({
  nombreMin: 5,
  potenciaMin: 20,
  potenciaMax: 30,
  modeloMin: undefined,
  funcionaDefault: undefined,
  fechaNullable: false
});

export const schemaB = createSchema({
  nombreMin: 3,
  potenciaMin: 80,
  potenciaMax: 100,
  modeloMin: 10,
  funcionaDefault: undefined,
  fechaNullable: true
});

export const schemaC = createSchema({
  nombreMin: 1,
  potenciaMin: 10,
  potenciaMax: 20,
  modeloMin: 5,
  funcionaDefault: true,
  fechaNullable: true
});

export const schemaOrders = z.object({
  titulo: z.string()
    .min(5, {
      message: "El titulo debe contener por lo menos 5 caracteres.",
    })
    .max(30, {
      message: "El titulo debe tener como máximo 30 caracteres.",
    }),
  tipo_servicio: z.string()
    .nullable()
    .transform(value => value === null ? "" : value)
    .refine(value => value.length > 0, {
      message: "Por favor, selecciona un tipo de servicio.",
    }),
  tipo_equipo: z.string()
    .nullable()
    .transform(value => value === null ? "" : value)
    .refine(value => value.length > 0, {
      message: "Por favor, selecciona un tipo de equipo.",
    }),
  numOrden: z.string()
    .min(3, {
      message: "El numero de orden debe contener por lo menos 3 caracteres.",
    })
    .max(50, {
      message: "El numero de orden debe tener como máximo 50 caracteres.",
    }),
  cliente: z.string()
    .min(2, {
      message: "El cliente debe contener por lo menos 2 caracteres.",
    })
    .max(100, {
      message: "El cliente debe tener como máximo 30 caracteres.",
    }),
  responsable: z.string()
    .nullable()
    .transform(value => value === null ? "" : value)
    .refine(value => value.length > 0, {
      message: "Por favor, selecciona un responsable.",
    }),
  idequipo: z.string()
    .min(3, {
      message: "El id del equipo debe contener por lo menos 3 caracteres.",
    })
    .max(10, {
      message: "El id del equipo debe tener como máximo 10 caracteres.",
    }),
});

export const schemaUsers = z.object({

  usuario: z.string()
    .min(2, {
      message: "El nombre de usuario debe tener por lo menos 2 caracteres.",
    })
    .max(15, {
      message: "El nombre de usuario debe tener como máximo 15 caracteres.",
    }),

  rol: z.string()
    .nullable()
    .transform(value => value === null ? "" : value)
    .refine(value => value.length > 0, {
      message: "Por favor, selecciona un rol.",
    }),

  password: z.string()
    .min(8, {
      message: "La contraseña debe tener por lo menos 8 caracteres.",
    })
    .max(20, {
      message: "La contraseña debe tener como máximo 20 caracteres.",
    }),
});

export const schemaLogin = z.object({
  username: z.string()
    .min(2, {
      message: "El nombre de usuario debe tener por lo menos 2 caracteres.",
    })
    .max(15, {
      message: "El nombre de usuario debe tener como máximo 15 caracteres.",
    }),


  password: z.string()
    .min(8, {
      message: "La contraseña debe tener por lo menos 8 caracteres.",
    })
    .max(20, {
      message: "La contraseña debe tener como máximo 20 caracteres.",
    })

});

export const schemaGenerico = z.object({

  nombre_Generico: z.string()
    .nullable()
    .transform(value => value === null ? "" : value)
    .refine(value => value.length > 0, {
      message: "Por favor, ingrese un valor.",
    }),
});


export const schemaParams = z.object({
  sistema_parametro: z.string()
    .nullable()
    .transform(value => value === null ? "" : value)
    .refine(value => value.length > 0, {
      message: "Por favor, selecciona un sistema parámetro.",
    }),
  tipo_dato: z.string()
    .nullable()
    .transform(value => value === null ? "" : value)
    .refine(value => value.length > 0, {
      message: "Por favor, selecciona un tipo de dato.",
    }),
  unidad_medida: z.string()
    .nullable()
    .transform(value => value === null ? "" : value),
  etapa: z.string()
    .nullable()
    .transform(value => value === null ? "" : value)
    .refine(value => value.length > 0, {
      message: "Por favor, selecciona una etapa.",
    }),
}).refine(data => {
  if (data.tipo_dato !== "string" && data.tipo_dato !== "bool") {
    return data.unidad_medida && data.unidad_medida.length > 0;
  }
  return true;
}, {
  message: "Por favor, selecciona una unidad de medida.",
  path: ["unidad_medida"],
});

export function hasAtLeastOneTrue(data) {
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (Object.values(row).some(value => typeof value === 'boolean' && value === true)) {
      return true;
    }
  }
  return false;
}


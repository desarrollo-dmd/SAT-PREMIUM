const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const updateModel = require("../Utils/ModelsUtils");
require("dotenv").config();

/// <summary>
/// Crea un nuevo usuario en el sistema.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene los datos del usuario.</param>
/// <param name="res">La respuesta HTTP para enviar de vuelta al cliente.</param>
/// <returns>Devuelve un mensaje de éxito y los datos del usuario creado si la creación es exitosa; de lo contrario, un mensaje de error.</returns>
const CreateUser = async (req, res) => {
  try {
    const data = req.body;

    data.usuario = data.usuario ? data.usuario.replace(/\s+/g, '') : '';
    
    const result = await updateModel.createModel(User, data);

    if (result.status === 201) {
      res
        .status(result.status)
        .json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }

  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear el usuario: " + error.message });
  }
};

/// <summary>
/// Permite a un usuario iniciar sesión en el sistema utilizando su nombre de usuario y contraseña.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene las credenciales del usuario.</param>
/// <param name="res">La respuesta HTTP para enviar de vuelta al cliente.</param>
/// <returns>Devuelve un mensaje de éxito, un token de acceso, el nombre de usuario y el rol si el inicio de sesión es exitoso; de lo contrario, un mensaje de error.</returns>
const Login = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    // data.usuario = data.usuario ? data.usuario.replace(/\s+/g, '') : '';
    const usuarioEncontrado = await User.buscarPorUsuario(usuario ? usuario.replace(/\s+/g, '') : '');
    if (!usuarioEncontrado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const esValido = await usuarioEncontrado.validarPassword(password);
    if (!esValido) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const estaAutorizado = usuarioEncontrado.autorizacionSAT;

    if (!estaAutorizado) {
      return res.status(403).json({ message: "No estás autorizado para acceder" });
    }

    const token = jwt.sign(
      { userId: usuario, rol: usuarioEncontrado.rol },
      process.env.secretKey,
      { expiresIn: "8h" }
    );
    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token: token,
      usuario: usuarioEncontrado.usuario,
      rol: usuarioEncontrado.rol,
      token: token,
    });
  } catch (error) {
    console.error('Error inesperado al iniciar sesión:', error);
    res.status(500).json({ error: "Error inesperado al iniciar sesión. Inténtelo más tarde." });
  }
};

/// <summary>
/// Obtiene la lista de columnas y todos los usuarios de la base de datos.
/// </summary>
/// <param name="req">La solicitud HTTP.</param>
/// <param name="res">La respuesta HTTP que se enviará de vuelta al cliente.</param>
/// <returns>Devuelve un objeto que contiene un array de nombres de columnas y un array con los elementos de usuarios encontrados.</returns>
const TableUsers = async (req, res) => {
  try {
    const columnArray = Object.keys(User.getAttributes());
    const elementsArray = await User.findAll();
    res.status(200).json({ columnArray, elementsArray });
  } catch {
    res.status(400).json({
      error: "error" + error.message,
    });
  }
};

/// <summary>
/// Obtiene la lista de columnas de la tabla de usuarios.
/// </summary>
/// <param name="req">La solicitud HTTP.</param>
/// <param name="res">La respuesta HTTP que se enviará de vuelta al cliente.</param>
/// <returns>Devuelve un objeto que contiene un array con los nombres de las columnas de la tabla de usuarios.</returns>
const GetColumns = async (req, res) => {
  try {
    const listacolumnas = Object.keys(User.getAttributes());
    res.status(200).json({ listacolumnas });
  } catch {
    res.status(400).json({
      error: "error" + error.message,
    });
  }
};

/// <summary>
/// Obtiene la lista de todos los usuarios registrados.
/// </summary>
/// <param name="req">La solicitud HTTP.</param>
/// <param name="res">La respuesta HTTP que se enviará de vuelta al cliente.</param>
/// <returns>Devuelve un objeto que contiene un mensaje y la lista de usuarios encontrados.</returns>
const GetUsers = async (req, res) => {
  try {
    const elementoEncontrado = await User.findAll();
    res.status(200).json({ mensaje: "Usuarios", elementoEncontrado });
  } catch (error) {
    res.status(400).json({
      error: "Error al devolver la lista de usuarios: " + error.message,
    });
  }
};

/// <summary>
/// Actualiza la información de un usuario específico según su ID.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene el ID del usuario y los nuevos datos.</param>
/// <param name="res">La respuesta HTTP que se enviará de vuelta al cliente.</param>
/// <returns>Devuelve un objeto que contiene un mensaje de éxito y los datos actualizados del usuario.</returns>
const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    data.usuario = data.usuario ? data.usuario.replace(/\s+/g, '') : '';
    
    const user = await User.buscarPorId(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.actualizarDatos(data);
    const updatedUser = await User.buscarPorId(id);

    res.status(200).json({ message: 'Actualización exitosa', data: updatedUser });
  } catch (error) {
    console.error("Error en la función UpdateUser:", error);
    res.status(400).json({ error: "Error al actualizar el usuario: " + error.message });
  }
};


/// <summary>
/// Elimina un usuario específico según su ID.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene el ID del usuario a eliminar.</param>
/// <param name="res">La respuesta HTTP que se enviará de vuelta al cliente.</param>
/// <returns>Devuelve un mensaje de éxito si se elimina el usuario, o un mensaje de error si ocurre un problema.</returns>
const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateModel.deleteModel(User, { id });

    if (result.status === 200) {
      res.status(result.status).json({ message: result.message });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

/// <summary>
/// Obtiene una lista de usuarios filtrados por su rol específico.
/// </summary>
/// <param name="req">La solicitud HTTP que puede contener un parámetro de consulta 'rol' para filtrar los usuarios.</param>
/// <param name="res">La respuesta HTTP que se enviará de vuelta al cliente.</param>
/// <returns>Devuelve una lista de usuarios que coinciden con el rol especificado, o un mensaje de error si no se proporciona un rol o no se encuentran usuarios.</returns>
const GetUsersByRole = async (req, res) => {
  try {
    const { rol } = req.query;

    if (!rol) {
      return res.status(400).json({ error: "Debe proporcionar un rol para filtrar" });
    }
    const usuariosFiltrados = await User.findAll({ where: { rol } });

    if (usuariosFiltrados.length === 0) {
      return res.status(404).json({ mensaje: "No se encontraron usuarios con ese rol" });
    }

    res.status(200).json({ mensaje: `Usuarios con el rol ${rol}`, usuariosFiltrados });
  } catch (error) {
    console.error("Error al obtener usuarios por rol:", error);
    res.status(500).json({
      error: "Error al obtener la lista de usuarios por rol: " + error.message,
    });
  }
};

module.exports = {
  CreateUser,
  Login,
  GetUsers,
  UpdateUser,
  DeleteUser,
  GetColumns,
  TableUsers,
  GetUsersByRole,
};
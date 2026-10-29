import mongoose from "mongoose";

// Configuración de la conexión a la base de datos
export const startDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // await mongoose.connection.dropDatabase(); // Eliminar la base de datos antes de iniciar la conexión
    // await mongoose.connection.db.dropCollection("users"); // Eliminar la colección "users" antes de iniciar la conexión
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error("No se pudo conectar a la base de datos", error);
  }
};

import mongoose from "mongoose";

// Function to connect to the mongodb database
// console.log(process.env.MONGODB_URI);

// export const connectDB = async () => {
//   try {
//     mongoose.connection.on("connected", () => {
//       console.log("Database connected");
//     });
//     await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
//   } catch (error) {
//     console.log(error);
//   }
// };
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("Already connected to database");
    return;
  }

  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1); // Exit if cannot connect
  }
};

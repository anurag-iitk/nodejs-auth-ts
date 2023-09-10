import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { users?: mongoDB.Collection } = {};

export async function connectToDatabase() {
  dotenv.config();

  if (
    !process.env.AUTH_DB_STRING ||
    !process.env.AUTH_DB_NAME ||
    !process.env.AUTH_COLLECTION_NAME
  ) {
    throw new Error("Database environment variables not set");
  }

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.AUTH_DB_STRING
  );

  try {
    await client.connect();

    const db: mongoDB.Db = client.db(process.env.AUTH_DB_NAME);
    const usersCollection: mongoDB.Collection = db.collection(
      process.env.AUTH_COLLECTION_NAME
    );

    collections.users = usersCollection;

    console.log(
      `Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`
    );
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
}

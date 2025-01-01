import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!uri) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db();
  }

  return { client, db };
}
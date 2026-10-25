// dynamodbClient.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const dynamoDb = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

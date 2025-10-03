import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
})

export async function putItem(
  tableName: string,
  item: Record<string, unknown>,
): Promise<void> {
  await documentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
    }),
  )
}

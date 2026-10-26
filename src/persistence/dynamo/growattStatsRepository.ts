import { randomUUID } from 'crypto'
import config from '../../config'
import { putItem } from './dynamoClient'
import type { GrowattStats } from '../../integrations/growatt'

// Keep existing deviceStats records untouched. Different partition key
// allows historical Growatt samples in the same DynamoDB table.
export async function saveGrowattStats(stats: GrowattStats): Promise<void> {
  await putItem(config.DEVICE_STATS_TABLE_NAME, {
    id: randomUUID(),
    type: 'growattStats',
    timestamp: new Date().toISOString(),
    payload: stats,
  })
}

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function purge() {
  console.log('🗑️  Starting database purge...')

  // Delete in correct order to respect foreign key constraints
  console.log('Deleting AnchorJobs...')
  await prisma.anchorJob.deleteMany()

  console.log('Deleting AnchorTxs...')
  await prisma.anchorTx.deleteMany()

  console.log('Deleting Events...')
  await prisma.event.deleteMany()

  console.log('Deleting AggregationPacks...')
  await prisma.aggregationPack.deleteMany()

  console.log('Deleting Aggregations...')
  await prisma.aggregation.deleteMany()

  console.log('Deleting Packs...')
  await prisma.pack.deleteMany()

  console.log('Deleting Batches...')
  await prisma.batch.deleteMany()

  console.log('Deleting Products...')
  await prisma.product.deleteMany()

  console.log('Deleting Locations...')
  await prisma.location.deleteMany()

  console.log('Deleting Organisations...')
  await prisma.organisation.deleteMany()

  console.log('✅ Database purged successfully!')
}

purge()
  .catch(e => {
    console.error('❌ Purge failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
  
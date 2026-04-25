import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const schemaPath = path.join(root, 'prisma', 'schema.prisma')
const generatedSchemaPath = path.join(root, 'prisma', 'schema.generated.prisma')

const provider = process.env.PRISMA_DB_PROVIDER || 'postgresql'

if (!fs.existsSync(schemaPath)) {
  throw new Error(`Missing Prisma schema at ${schemaPath}`)
}

const allowedProviders = new Set(['postgresql', 'sqlite', 'mysql'])

if (!allowedProviders.has(provider)) {
  throw new Error(
    `Invalid PRISMA_DB_PROVIDER="${provider}". Expected one of: ${Array.from(
      allowedProviders,
    ).join(', ')}`,
  )
}

let schema = fs.readFileSync(schemaPath, 'utf8')

const datasourceRegex = /datasource\s+db\s*\{[\s\S]*?\}/m

const datasourceBlock =
  provider === 'postgresql'
    ? `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`
    : provider === 'sqlite'
      ? `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`
      : `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`

if (!datasourceRegex.test(schema)) {
  throw new Error('Unable to find datasource db block in prisma/schema.prisma.')
}

schema = schema.replace(datasourceRegex, datasourceBlock)

fs.writeFileSync(generatedSchemaPath, schema)

console.log(
  `[prisma:prepare] datasource provider set to ${provider} in prisma/schema.generated.prisma (PRISMA_DB_PROVIDER)`,
)
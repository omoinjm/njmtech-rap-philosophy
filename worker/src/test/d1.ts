import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../migrations/d1',
)

function splitSql(sql: string): string[] {
  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
}

function runMigrations(db: Database.Database): void {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    for (const statement of splitSql(sql)) {
      db.exec(statement)
    }
  }
}

function prepareStatement(db: Database.Database, query: string) {
  const stmt = db.prepare(query)
  let bound: unknown[] = []

  const prepared = {
    bind(...params: unknown[]) {
      bound = params
      return prepared
    },
    async first<T>() {
      const row = stmt.get(...bound) as T | undefined
      return row ?? null
    },
    async all<T>() {
      return { results: stmt.all(...bound) as T[] }
    },
    async run() {
      stmt.run(...bound)
      return { success: true, meta: {} }
    },
  }

  return prepared
}

export function createTestD1(): D1Database {
  const db = new Database(':memory:')
  runMigrations(db)

  return {
    prepare(query: string) {
      return prepareStatement(db, query)
    },
    async batch<T extends D1PreparedStatement>(statements: T[]) {
      const results = []
      for (const statement of statements) {
        results.push(await statement.run())
      }
      return results
    },
    async exec(query: string) {
      db.exec(query)
    },
    withSession() {
      throw new Error('withSession is not implemented in test D1')
    },
    async dump() {
      return new Map()
    },
  } as unknown as D1Database
}

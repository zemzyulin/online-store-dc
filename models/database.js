import postgres from 'postgres';

const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: "postgres",
  username: "postgres",
  password: "postgres"
})

export default sql;
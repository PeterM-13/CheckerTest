
import { v4 as uuidv4} from 'uuid';

//uuidv4();


// async function to get condition
async function getAll() {
  const results = await pool.query(
    `SELECT * FROM checker;`
  );
  const rows = results.rows[0];
  return rows;
}

async function getCode(id) {
  const results = await pool.query(
    `SELECT * FROM checker WHERE code_id = $1;`, [id]
  );
  const rows = results.rows[0];
  return rows;
}

// async function to set option
async function setStatus(body) {
  const results = await pool.query(
    `UPDATE checker 
    SET status = $1
    WHERE code_id = $2
    RETURNING *;`,
    [body.value.status, body.value.id])
  const row = results.rows[0];
  return row;
}

async function addCode(body) {
  const results = await pool.query(
    `INSERT INTO checker (code_id, status, place) 
    VALUES ('$1', '$2', '$3');
    RETURNING *;`,
    [body.value.id, body.value.status, body.value.place])
  const row = results.rows[0];
  return row;
}

export { getAll, setStatus, addCode };
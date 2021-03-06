// inside db/index.js
const { Client } = require("pg"); // imports the pg module

// supply the db name and location of the database
const client = new Client("postgres://localhost:5432/juicebox-dev");

// inside db/index.js

async function createPost({ authorId, title, content }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO posts(authorId, title, content) 
      VALUES($1, $2, $3) 
      RETURNING *;
    `,
      [authorId, title, content]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    const { rows: user } = await client.query(
      `UPDATE posts
      SET ${setString}
      RETURNING *;
      `,
      Object.values(fields)
    );
    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(
      `SELECT title, content, active
      FROM posts;
    `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const {
      rows: [user],
    } = client.query(`
      SELECT id, username,location, name FROM posts
      WHERE "authorId"=${userId};
    `).join(`SELECT posts FROM posts
    WHERE "authorId"=${userId};
  `);
    if (!rows) {
      return null;
    } else {
      return user;
    }
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows } = await client.query(
      `
    SELECT user from posts
    WHERE authorId=${userId}

  `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

// in db/index.js
async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `,
      [username, password, name, location]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT  id, username,name, location, active
    FROM users;
  `
  );

  return rows;
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

// and export them
module.exports = {
  createPost,
  updatePost,
  getPostsByUser,
  updateUser,
  createUser,
  client,
  getAllUsers,
  getAllPosts,
  getUserById,
};

const pool = require('../config/db');
const path = require('path');

const uploadContent = async ({ title, description, subject, file, teacherId, start_time, end_time, rotation_duration }) => {
  if (!file) throw { status: 400, message: 'File is required.' };
  if (!title) throw { status: 400, message: 'Title is required.' };
  if (!subject) throw { status: 400, message: 'Subject is required.' };

  const normalizedSubject = subject.toLowerCase().trim();

  if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
    throw { status: 400, message: 'start_time must be before end_time.' };
  }

  const file_url = `/uploads/${file.filename}`;
  const file_type = path.extname(file.originalname).replace('.', '').toLowerCase();
  const file_size = file.size;
  const duration = parseInt(rotation_duration) || 5;

  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    await conn.query(
      `INSERT INTO content (id, title, description, subject, file_url, file_type, file_size, uploaded_by, status, start_time, end_time)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [title, description || null, normalizedSubject, file_url, file_type, file_size, teacherId, start_time || null, end_time || null]
    );

    const [contentRows] = await conn.query(
      'SELECT * FROM content WHERE uploaded_by = ? ORDER BY created_at DESC LIMIT 1',
      [teacherId]
    );
    const content = contentRows[0];

    // Find or create slot
    const [slotRows] = await conn.query(
      'SELECT id FROM content_slots WHERE subject = ? AND teacher_id = ?',
      [normalizedSubject, teacherId]
    );

    let slotId;
    if (slotRows.length === 0) {
      await conn.query(
        'INSERT INTO content_slots (id, subject, teacher_id) VALUES (UUID(), ?, ?)',
        [normalizedSubject, teacherId]
      );
      const [newSlot] = await conn.query(
        'SELECT id FROM content_slots WHERE subject = ? AND teacher_id = ?',
        [normalizedSubject, teacherId]
      );
      slotId = newSlot[0].id;
    } else {
      slotId = slotRows[0].id;
    }

    // Get next rotation order
    const [orderRows] = await conn.query(
      'SELECT COALESCE(MAX(rotation_order), -1) + 1 AS next_order FROM content_schedule WHERE slot_id = ?',
      [slotId]
    );
    const rotationOrder = orderRows[0].next_order;

    await conn.query(
      'INSERT INTO content_schedule (id, content_id, slot_id, rotation_order, duration) VALUES (UUID(), ?, ?, ?, ?)',
      [content.id, slotId, rotationOrder, duration]
    );

    await conn.query('COMMIT');
    return { ...content, rotation_order: rotationOrder, rotation_duration: duration };
  } catch (err) {
    await conn.query('ROLLBACK');
    throw err;
  } finally {
    conn.release();
  }
};

const getMyContent = async (teacherId, { status, subject } = {}) => {
  let query = `
    SELECT c.*, u.name AS uploader_name, p.name AS approver_name,
           cs.rotation_order, cs.duration AS rotation_duration
    FROM content c
    LEFT JOIN users u ON c.uploaded_by = u.id
    LEFT JOIN users p ON c.approved_by = p.id
    LEFT JOIN content_schedule cs ON cs.content_id = c.id
    WHERE c.uploaded_by = ?
  `;
  const params = [teacherId];
  if (status) { query += ' AND c.status = ?'; params.push(status); }
  if (subject) { query += ' AND c.subject = ?'; params.push(subject.toLowerCase().trim()); }
  query += ' ORDER BY c.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

const getAllContent = async ({ status, subject, teacherId } = {}) => {
  let query = `
    SELECT c.*, u.name AS uploader_name, u.email AS uploader_email,
           p.name AS approver_name, cs.rotation_order, cs.duration AS rotation_duration
    FROM content c
    LEFT JOIN users u ON c.uploaded_by = u.id
    LEFT JOIN users p ON c.approved_by = p.id
    LEFT JOIN content_schedule cs ON cs.content_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (status) { query += ' AND c.status = ?'; params.push(status); }
  if (subject) { query += ' AND c.subject = ?'; params.push(subject.toLowerCase().trim()); }
  if (teacherId) { query += ' AND c.uploaded_by = ?'; params.push(teacherId); }
  query += ' ORDER BY c.created_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
};

module.exports = { uploadContent, getMyContent, getAllContent };

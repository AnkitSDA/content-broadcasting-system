const pool = require('../config/db');

const approveContent = async (contentId, principalId) => {
  const [rows] = await pool.query('SELECT * FROM content WHERE id = ?', [contentId]);
  if (rows.length === 0) throw { status: 404, message: 'Content not found.' };

  if (rows[0].status !== 'pending') {
    throw { status: 400, message: `Content is already ${rows[0].status}.` };
  }

  await pool.query(
    `UPDATE content SET status = 'approved', approved_by = ?, approved_at = NOW(), rejection_reason = NULL WHERE id = ?`,
    [principalId, contentId]
  );

  const [updated] = await pool.query('SELECT * FROM content WHERE id = ?', [contentId]);
  return updated[0];
};

const rejectContent = async (contentId, principalId, rejectionReason) => {
  if (!rejectionReason || rejectionReason.trim() === '') {
    throw { status: 400, message: 'Rejection reason is required.' };
  }

  const [rows] = await pool.query('SELECT * FROM content WHERE id = ?', [contentId]);
  if (rows.length === 0) throw { status: 404, message: 'Content not found.' };

  if (rows[0].status !== 'pending') {
    throw { status: 400, message: `Content is already ${rows[0].status}.` };
  }

  await pool.query(
    `UPDATE content SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ? WHERE id = ?`,
    [principalId, rejectionReason.trim(), contentId]
  );

  const [updated] = await pool.query('SELECT * FROM content WHERE id = ?', [contentId]);
  return updated[0];
};

const getPendingContent = async () => {
  const [rows] = await pool.query(
    `SELECT c.*, u.name AS uploader_name, u.email AS uploader_email,
            cs.rotation_order, cs.duration AS rotation_duration
     FROM content c
     LEFT JOIN users u ON c.uploaded_by = u.id
     LEFT JOIN content_schedule cs ON cs.content_id = c.id
     WHERE c.status = 'pending'
     ORDER BY c.created_at ASC`
  );
  return rows;
};

module.exports = { approveContent, rejectContent, getPendingContent };

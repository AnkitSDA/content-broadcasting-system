const pool = require('../config/db');

const getLiveContentForTeacher = async (teacherId) => {
  const now = new Date();

  const [allContent] = await pool.query(
    `SELECT c.id, c.title, c.description, c.subject, c.file_url, c.file_type,
            c.start_time, c.end_time, u.name AS teacher_name,
            cs.rotation_order, cs.duration
     FROM content c
     JOIN users u ON c.uploaded_by = u.id
     LEFT JOIN content_schedule cs ON cs.content_id = c.id
     WHERE c.uploaded_by = ?
       AND c.status = 'approved'
       AND c.start_time IS NOT NULL
       AND c.end_time IS NOT NULL
       AND c.start_time <= ?
       AND c.end_time >= ?
     ORDER BY c.subject, cs.rotation_order ASC`,
    [teacherId, now, now]
  );

  if (allContent.length === 0) return null;

  // Group by subject
  const bySubject = {};
  for (const item of allContent) {
    if (!bySubject[item.subject]) bySubject[item.subject] = [];
    bySubject[item.subject].push(item);
  }

  const activeContent = {};
  const nowMinutes = now.getTime() / (1000 * 60);

  for (const [subject, items] of Object.entries(bySubject)) {
    items.sort((a, b) => (a.rotation_order ?? 0) - (b.rotation_order ?? 0));

    const totalCycleDuration = items.reduce((sum, item) => sum + (item.duration || 5), 0);
    if (totalCycleDuration === 0) continue;

    const positionInCycle = nowMinutes % totalCycleDuration;

    let elapsed = 0;
    for (const item of items) {
      elapsed += (item.duration || 5);
      if (positionInCycle < elapsed) {
        activeContent[subject] = {
          id: item.id,
          title: item.title,
          description: item.description,
          subject: item.subject,
          file_url: item.file_url,
          file_type: item.file_type,
          teacher_name: item.teacher_name,
          start_time: item.start_time,
          end_time: item.end_time,
          scheduling_info: {
            total_items_in_rotation: items.length,
            cycle_duration_minutes: totalCycleDuration,
            current_position_in_cycle: Math.floor(positionInCycle),
            next_content_in: Math.ceil(elapsed - positionInCycle),
          },
        };
        break;
      }
    }
  }

  if (Object.keys(activeContent).length === 0) return null;
  return activeContent;
};

const getSchedulePreview = async (teacherId, subject) => {
  const normalizedSubject = subject.toLowerCase().trim();
  const now = new Date();

  const [items] = await pool.query(
    `SELECT c.id, c.title, c.subject, c.start_time, c.end_time, c.status,
            cs.rotation_order, cs.duration
     FROM content c
     LEFT JOIN content_schedule cs ON cs.content_id = c.id
     WHERE c.uploaded_by = ? AND c.subject = ?
     ORDER BY cs.rotation_order ASC`,
    [teacherId, normalizedSubject]
  );

  const totalDuration = items
    .filter(i => i.status === 'approved')
    .reduce((sum, i) => sum + (i.duration || 5), 0);

  return {
    subject: normalizedSubject,
    total_items: items.length,
    approved_items: items.filter(i => i.status === 'approved').length,
    total_cycle_duration_minutes: totalDuration,
    items: items.map(i => ({
      ...i,
      is_in_window: i.start_time && i.end_time
        ? now >= new Date(i.start_time) && now <= new Date(i.end_time)
        : false,
    })),
  };
};

module.exports = { getLiveContentForTeacher, getSchedulePreview };

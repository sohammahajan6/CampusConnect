const db = require('./utils/db');

async function sendFeedbackNotifications() {
  try {
    console.log('Sending feedback notifications for completed events...');
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format

    // Find events that have ended (in the past)
    const completedEvents = await db.query(`
      SELECT e.*, u.user_id as organizer_id, u.name as organizer_name
      FROM events e
      JOIN users u ON e.created_by = u.user_id
      WHERE e.status = 'approved'
      AND (e.date < $1 OR (e.date = $1 AND e.time < $2))
    `, [today, currentTime]);

    console.log(`Found ${completedEvents.rows.length} completed events`);

    let notificationCount = 0;

    // For each completed event, send notifications to registered users who haven't submitted feedback
    for (const event of completedEvents.rows) {
      console.log(`Processing event: ${event.title} (ID: ${event.event_id})`);
      
      // Get all registrations for this event
      const registrations = await db.query(`
        SELECT r.user_id, u.name, u.email
        FROM registrations r
        JOIN users u ON r.user_id = u.user_id
        LEFT JOIN feedback f ON r.event_id = f.event_id AND r.user_id = f.user_id
        WHERE r.event_id = $1
        AND r.status = 'confirmed'
        AND f.feedback_id IS NULL
      `, [event.event_id]);

      console.log(`Found ${registrations.rows.length} registrations without feedback`);

      // Send notification to each registered user
      for (const registration of registrations.rows) {
        // Check if notification already exists
        const existingNotification = await db.query(`
          SELECT * FROM notifications
          WHERE user_id = $1 AND event_id = $2 AND message LIKE '%feedback%'
        `, [registration.user_id, event.event_id]);

        if (existingNotification.rows.length === 0) {
          await db.query(`
            INSERT INTO notifications (user_id, event_id, message)
            VALUES ($1, $2, $3)
          `, [
            registration.user_id,
            event.event_id,
            `Please provide feedback for the event "${event.title}" that you attended`
          ]);
          
          console.log(`Sent feedback notification to user ${registration.name} (${registration.email})`);
          notificationCount++;
        } else {
          console.log(`Notification already exists for user ${registration.name} (${registration.email})`);
        }
      }
    }

    console.log(`Successfully sent ${notificationCount} feedback notifications`);
  } catch (error) {
    console.error('Error sending feedback notifications:', error);
  } finally {
    process.exit();
  }
}

// Execute the function
sendFeedbackNotifications();

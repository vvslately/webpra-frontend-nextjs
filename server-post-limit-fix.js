// ==================== POST LIMIT FIX - REPLACE IN YOUR server.js ====================
// 
// ในไฟล์ server.js ของคุณ หา endpoint: app.post('/posts', authenticateToken, ...)
// แล้วแทนที่ส่วน "Check user role and post limit" ด้วยโค้ดด้านล่างนี้

// ===== CODE TO REPLACE =====

// Check user subscription status and post limit
const userId = req.user.id;

// Check if user has active subscription
const [activeSubscriptions] = await pool.query(
  `SELECT id, expires_at FROM subscriptions 
   WHERE user_id = ? AND status = 'active'
   ORDER BY created_at DESC
   LIMIT 1`,
  [userId]
);

let hasActiveSubscription = false;

if (activeSubscriptions.length > 0) {
  const subscription = activeSubscriptions[0];
  
  // Check if subscription is expired
  if (subscription.expires_at) {
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    
    if (expiresAt >= now) {
      // Subscription is still valid
      hasActiveSubscription = true;
    } else {
      // Subscription expired, update status
      await pool.query(
        'UPDATE subscriptions SET status = "expired" WHERE id = ?',
        [subscription.id]
      );
      
      // Update user role back to member if no other active subscription
      await pool.query(
        `UPDATE users SET role = 'member' 
         WHERE id = ? AND NOT EXISTS (
           SELECT 1 FROM subscriptions 
           WHERE user_id = ? AND status = 'active'
         )`,
        [userId, userId]
      );
    }
  } else {
    // No expiration date, consider it active
    hasActiveSubscription = true;
  }
}

// Check daily post limit only for non-subscribers
if (!hasActiveSubscription) {
  // Get today's date range (start of day to end of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.toISOString().slice(0, 19).replace('T', ' ');
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = tomorrow.toISOString().slice(0, 19).replace('T', ' ');

  // Count posts created today by this user
  const [postCount] = await pool.query(
    'SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND created_at >= ? AND created_at < ?',
    [userId, todayStart, tomorrowStart]
  );

  const dailyPostCount = postCount[0].count;
  const dailyPostLimit = 5;

  if (dailyPostCount >= dailyPostLimit) {
    return res.status(403).json({
      status: 'error',
      message: `Daily post limit reached. You can only post ${dailyPostLimit} times per day. Please subscribe to post unlimited.`,
      limit: dailyPostLimit,
      current: dailyPostCount
    });
  }
}
// If user has active subscription, they can post unlimited (no limit check)

// ===== END OF CODE TO REPLACE =====


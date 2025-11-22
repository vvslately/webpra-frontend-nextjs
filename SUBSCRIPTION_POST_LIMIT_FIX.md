# การแก้ไข Post Limit ตาม Subscription Status

## สิ่งที่ต้องแก้ไข

ในไฟล์ `server.js` ของคุณ ให้หา section นี้:

```javascript
// Check user role and post limit
const [users] = await pool.query(
  'SELECT role FROM users WHERE id = ?',
  [req.user.id]
);

if (users.length === 0) {
  return res.status(404).json({
    status: 'error',
    message: 'User not found'
  });
}

const userRole = users[0].role;

// Check daily post limit for non-subscribers (member role)
if (userRole === 'member') {
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
    [req.user.id, todayStart, tomorrowStart]
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
```

## แทนที่ด้วยโค้ดนี้:

```javascript
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
```

## สรุปการเปลี่ยนแปลง:

1. **เปลี่ยนจากการตรวจสอบ role** เป็น **การตรวจสอบ subscription ที่ active**
2. **ตรวจสอบวันหมดอายุ** ของ subscription และอัปเดตสถานะถ้าหมดอายุ
3. **ผู้ที่มี active subscription** → โพสต์ได้ไม่จำกัด
4. **ผู้ที่ไม่มี active subscription** → จำกัดวันละ 5 โพสต์

## ตำแหน่งที่ต้องแก้ไข:

ในไฟล์ `server.js` ของคุณ หา endpoint:
```javascript
app.post('/posts', authenticateToken, upload.array('images', 10), async (req, res) => {
```

แล้วแทนที่ส่วน "Check user role and post limit" ด้วยโค้ดใหม่ข้างต้น


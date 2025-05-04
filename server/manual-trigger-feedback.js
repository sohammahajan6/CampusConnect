const axios = require('axios');

async function triggerFeedbackNotifications() {
  try {
    console.log('Manually triggering feedback notifications...');
    
    // First, login as admin to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@campus.edu',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Admin login successful');
    
    // Call the feedback notifications endpoint
    const response = await axios.post(
      'http://localhost:5000/api/feedback/notifications',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Response:', response.data);
    console.log('Feedback notifications triggered successfully!');
    
  } catch (error) {
    console.error('Error triggering feedback notifications:', error.response?.data || error.message);
  } finally {
    process.exit();
  }
}

// Execute the function
triggerFeedbackNotifications();

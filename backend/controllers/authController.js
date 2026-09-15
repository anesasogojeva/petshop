const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secretKey = process.env.JWT_SECRET || 'your_secret';
const bcrypt = require('bcrypt');
const User = require('../models/User');
const passwordValidator = require('../validators/passwordValidator'); // adjust path as needed
const { sendEmail } = require('../utils/mailService'); // adjust path as needed




/*exports.login = async (req, res) => {
  try {
    console.log('Received body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Log the email being passed
    console.log("Logging in with email:", email);

    // Fetch user from the database
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Compare passwords using bcrypt
    const match = await bcrypt.compare(password, user.password);

    // Log the result of password comparison
    console.log("Password match:", match);

    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // **Add the log for the JWT secrets here**
    console.log('Access Token Secret:', process.env.ACCESS_TOKEN_SECRET);
    console.log('Refresh Token Secret:', process.env.REFRESH_TOKEN_SECRET);

    // Prepare JWT payload
    const payload = { id: user.id, role: user.role, email: user.email };

    // Generate access and refresh tokens
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    // Store refresh token in the database (optional, for rotating refresh tokens)
    user.refreshToken = refreshToken;
    await user.save();

    // Send the response with tokens
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};*/
exports.login = async (req, res) => {
  try {
    console.log('Received body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Log the email being passed
    console.log("Logging in with email:", email);

    // Fetch user from the database
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Compare passwords using bcrypt
    const match = await bcrypt.compare(password, user.password);

    // Log the result of password comparison
    console.log("Password match:", match);

    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // *Add the log for the JWT secrets here*
    console.log('Access Token Secret:', process.env.ACCESS_TOKEN_SECRET);
    console.log('Refresh Token Secret:', process.env.REFRESH_TOKEN_SECRET);

    // Prepare JWT payload
    const payload = { id: user.id, role: user.role, email: user.email };

    // Generate access and refresh tokens
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    
    user.refreshToken = refreshToken;
    await user.save();

    // Send the response with tokens
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};

// In controllers/authController.js
/*exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};*/

/*exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if current password matches the saved password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    // Update the password
    user.password = newPassword;
    await user.save();

    // Send the email notification (you can customize this email template)
    await sendEmail(
      user.email, // Recipient email
      'Password Changed Successfully', // Subject
      'Your password has been successfully changed.' // Email body text
    );

    res.json({ message: 'Password updated successfully and email sent!' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};*/
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    const { valid, errors } = passwordValidator(newPassword);
    if (!valid) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    // ❌ Don't set user.password yet

    // ✅ Create a JWT token that includes the new password
    const secretKey = process.env.JWT_SECRET || 'your_secret';
    const token = jwt.sign(
      { id: user.id, newPassword }, // store plain newPassword temporarily
      secretKey,
      { expiresIn: '15m' }
    );

    user.confirmationToken = token;
    user.tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const confirmationUrl = `http://localhost:5000/api/auth/confirm-password-change?token=${token}`;

    await sendEmail(
      user.email,
      'Confirm Your Password Change',
      `Click the link below to confirm your password change: ${confirmationUrl}`,
      `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color:rgb(255, 255, 255);
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 30px;
      text-align: center;
    }
    .header {
      font-size: 26px;
      color: #C58177;
      margin-bottom: 10px;
    }
    .logo {
      width: 50px;
      height: 50px;
      margin-bottom: 10px;
    }
    .content {
      font-size: 16px;
      color: #333333;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #C58177;
      color: #FFFFFF;
      text-decoration: none;
      font-size: 16px;
      border-radius: 6px;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #b06f66;
    }
    .footer {
      font-size: 12px;
      color: #A67B8B;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <img src="cid:pawlogo" alt="Paw Logo" class="logo" />

    <div class="header">Pet Care App</div>
    <div class="content">
      You recently requested to change your password. Please confirm this action by clicking the button below.
    </div>
    <a href="${confirmationUrl}" class="button">Confirm Password Change</a>
    <div class="footer">
      If you didn’t request this, you can safely ignore this email.
    </div>
  </div>
</body>
</html>
  `
    );





    res.json({ message: 'Confirmation email sent. Please check your inbox.' });
  } catch (err) {
    console.error('Error initiating password change:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.sendStatus(403);
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Error during refresh token verification:', err);
    return res.sendStatus(403); // Forbidden if verification fails
  }
};
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    // Decode the token to get user ID
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Invalidate the refresh token
    user.refreshToken = null;
    await user.save();

    return res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Error during logout:', err);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

exports.confirmPasswordChange = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.confirmationToken !== token || user.tokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Token is invalid or expired' });
    }

    // ✅ Hash the password now (just before saving)
    user.password = decoded.newPassword;

    user.confirmationToken = null;
    user.tokenExpiry = null;
    await user.save();

    await sendEmail(
      user.email,
      'Password Successfully Changed 🛡️🔑',
      'Your password has been successfully changed. You can now log in with your new password.',
      `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color:rgb(255, 255, 255);
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 30px;
      text-align: center;
    }
    .header {
      font-size: 26px;
      color: #C58177;
      margin-bottom: 10px;
    }
    .logo {
      width: 60px;
      height: 60px;
      margin-bottom: 15px;
    }
    .content {
      font-size: 18px;
      color: #333333;
      margin-bottom: 30px;
    }
    .content p {
      color: #6c757d;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #C58177;
      color: #FFFFFF;
      text-decoration: none;
      font-size: 16px;
      border-radius: 6px;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #b06f66;
    }
    .footer {
      font-size: 14px;
      color: #A67B8B;
      margin-top: 30px;
    }
    .emoji {
      font-size: 28px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <img src="cid:pawlogo" alt="Paw Logo" class="logo" />
    <div class="header">
      <span class="emoji">🎉</span> Password Successfully Changed <span class="emoji">🔐</span>
    </div>
    <div class="content">
      <p>Your password has been successfully updated. 🎉 You can now log in with your new password!</p>
      <p>If you didn’t request this change, please contact our support team immediately. <span class="emoji">⚠️</span></p>
    </div>
    <div class="footer">
      <p>Need help? Contact our support team! <span class="emoji">💬</span></p>
    </div>
  </div>
</body>
</html>
  `
    );


    res.json({ message: 'Password successfully changed. Confirmation email sent.' });
  } catch (err) {
    console.error('Error confirming password change:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secretKey = process.env.JWT_SECRET || 'your_secret';
    const token = jwt.sign(
      { id: user.id },
      secretKey,
      { expiresIn: '15m' }
    );

    user.confirmationToken = token;
    user.tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].trim();
    const resetUrl = `${clientUrl}/reset-password?token=${token}`; // frontend route

    await sendEmail(
      user.email,
      'Reset Your Password',
      `Click here to reset your password: ${resetUrl}`,
      `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color:rgb(255, 255, 255);
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 30px;
      text-align: center;
    }
    .header {
      font-size: 24px;
      color: #C58177;
      margin-bottom: 20px;
    }
    .text {
      font-size: 16px;
      color: #555555;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background-color: #C58177;
      color: #FFFFFF;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #b06f66;
    }
    .footer {
      margin-top: 30px;
      font-size: 13px;
      color: #A67B8B;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="cid:pawlogo" alt="Paw Logo" style="width: 80px; height: auto; margin-bottom: 20px;" />

    <div class="header">Reset Your Password</div>

    <div class="text">
      <p>We received a request to reset your password.</p>
      <p>Click the button below to set a new password:</p>
    </div>
    <a class="button" href="${resetUrl}" target="_blank">Reset Password</a>
    <div class="footer">
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
  `
    );

    res.json({ message: 'Reset password email sent' });
  } catch (err) {
    console.error('Error in forgotPassword:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const secretKey = process.env.JWT_SECRET || 'your_secret';

    const { valid, errors } = passwordValidator(newPassword);
    if (!valid) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.confirmationToken !== token || user.tokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Token is invalid or expired' });
    }

    user.password = newPassword;
    user.confirmationToken = null;
    user.tokenExpiry = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Error in resetPassword:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generate backup codes
async function generateBackupCodes(count = 10) {
  const codes = [];
  const hashedCodes = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const salt = await bcrypt.genSalt(10);
    const hashCode = await bcrypt.hash(code, salt);
    
    codes.push(code);
    hashedCodes.push({
      code: hashCode,
      used: false
    });
  }
  
  return { codes, hashedCodes };
}

// Setup 2FA - Generate secret and QR code
router.post('/setup', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `ExpenseTracker:${user.email}`,
      issuer: 'ExpenseTracker'
    });

    // Save the secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan the QR code with your authenticator app, then verify with a code'
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify and enable 2FA
router.post('/verify-setup', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: 'Please setup 2FA first' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps tolerance
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Generate backup codes
    const { codes, hashedCodes } = await generateBackupCodes();
    
    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedCodes;
    await user.save();

    res.json({
      message: '2FA enabled successfully',
      backupCodes: codes
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disable 2FA
router.post('/disable', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new backup codes
router.post('/backup-codes', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate new backup codes
    const { codes, hashedCodes } = await generateBackupCodes();
    user.twoFactorBackupCodes = hashedCodes;
    await user.save();

    res.json({
      message: 'New backup codes generated',
      backupCodes: codes
    });
  } catch (error) {
    console.error('Backup codes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify 2FA token (for login)
router.post('/verify', async (req, res) => {
  try {
    const { userId, token, isBackupCode } = req.body;
    const user = await User.findById(userId);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    let verified = false;

    if (isBackupCode) {
      // Check backup codes
      // Iterate through unused backup codes and check if any match the input
      const unusedCodes = user.twoFactorBackupCodes.filter(bc => !bc.used);
      
      for (const bc of unusedCodes) {
        const isMatch = await bcrypt.compare(token.toUpperCase(), bc.code);
        if (isMatch) {
          bc.used = true;
          await user.save();
          verified = true;
          break;
        }
      }
    } else {
      // Verify TOTP
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Return success
    res.json({ 
      verified: true,
      message: '2FA verified successfully'
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get 2FA status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      enabled: user.twoFactorEnabled,
      backupCodesRemaining: user.twoFactorBackupCodes.filter(bc => !bc.used).length
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

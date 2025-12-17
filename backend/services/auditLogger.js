const fs = require('fs');
const path = require('path');

/**
 * Audit Logger Service
 * Logs security-relevant events for monitoring and compliance
 */

class AuditLogger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.logFile = path.join(this.logDir, 'audit.log');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatEntry(event) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      ...event
    }) + '\n';
  }

  log(event) {
    const entry = this.formatEntry(event);
    
    // Console log in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUDIT]', event);
    }

    // File log
    fs.appendFile(this.logFile, entry, (err) => {
      if (err) console.error('Failed to write audit log:', err);
    });
  }

  // Authentication Events
  loginSuccess(userId, email, ip, userAgent) {
    this.log({
      type: 'AUTH_LOGIN_SUCCESS',
      userId,
      email,
      ip,
      userAgent,
      severity: 'INFO'
    });
  }

  loginFailed(email, ip, userAgent, reason) {
    this.log({
      type: 'AUTH_LOGIN_FAILED',
      email,
      ip,
      userAgent,
      reason,
      severity: 'WARNING'
    });
  }

  logout(userId, ip) {
    this.log({
      type: 'AUTH_LOGOUT',
      userId,
      ip,
      severity: 'INFO'
    });
  }

  register(userId, email, ip) {
    this.log({
      type: 'AUTH_REGISTER',
      userId,
      email,
      ip,
      severity: 'INFO'
    });
  }

  // 2FA Events
  twoFactorEnabled(userId, ip) {
    this.log({
      type: '2FA_ENABLED',
      userId,
      ip,
      severity: 'INFO'
    });
  }

  twoFactorDisabled(userId, ip) {
    this.log({
      type: '2FA_DISABLED',
      userId,
      ip,
      severity: 'WARNING'
    });
  }

  twoFactorFailed(userId, ip, reason) {
    this.log({
      type: '2FA_VERIFICATION_FAILED',
      userId,
      ip,
      reason,
      severity: 'WARNING'
    });
  }

  backupCodeUsed(userId, ip) {
    this.log({
      type: '2FA_BACKUP_CODE_USED',
      userId,
      ip,
      severity: 'WARNING'
    });
  }

  // Security Events
  rateLimitExceeded(ip, endpoint) {
    this.log({
      type: 'RATE_LIMIT_EXCEEDED',
      ip,
      endpoint,
      severity: 'WARNING'
    });
  }

  suspiciousActivity(userId, ip, details) {
    this.log({
      type: 'SUSPICIOUS_ACTIVITY',
      userId,
      ip,
      details,
      severity: 'CRITICAL'
    });
  }

  // Data Events
  dataExport(userId, ip, exportType) {
    this.log({
      type: 'DATA_EXPORT',
      userId,
      ip,
      exportType,
      severity: 'INFO'
    });
  }

  passwordChanged(userId, ip) {
    this.log({
      type: 'PASSWORD_CHANGED',
      userId,
      ip,
      severity: 'INFO'
    });
  }

  accountDeleted(userId, email, ip) {
    this.log({
      type: 'ACCOUNT_DELETED',
      userId,
      email,
      ip,
      severity: 'WARNING'
    });
  }
}

// Singleton instance
const auditLogger = new AuditLogger();

module.exports = auditLogger;

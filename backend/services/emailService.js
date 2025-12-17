const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Only create transporter if email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      console.log('✉️  Email service initialized');
    } else {
      console.log('⚠️  Email service not configured (missing EMAIL_USER or EMAIL_PASSWORD)');
      this.transporter = null;
    }
  }

  async sendBudgetAlert(user, budget, spent, percentage) {
    if (!this.transporter) {
      console.log('Email service not configured, skipping budget alert');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Expense Tracker <noreply@expensetracker.com>',
      to: user.email,
      subject: `Budget Alert: ${budget.category} - ${percentage.toFixed(1)}% Used`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: ${percentage >= 100 ? '#fee2e2' : '#fef3c7'}; border-left: 4px solid ${percentage >= 100 ? '#ef4444' : '#f59e0b'}; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: ${percentage >= 100 ? '#ef4444' : '#f59e0b'}; }
            .stat-label { font-size: 14px; color: #6b7280; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Budget Alert</h1>
            </div>
            <div class="content">
              <p>Hi ${user.name},</p>
              <div class="alert-box">
                <strong>${percentage >= 100 ? '⚠️ Budget Exceeded!' : '⚡ Budget Warning'}</strong>
                <p>You've ${percentage >= 100 ? 'exceeded' : 'reached'} ${percentage.toFixed(1)}% of your budget for <strong>${budget.category}</strong>.</p>
              </div>
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">$${spent.toFixed(2)}</div>
                  <div class="stat-label">Spent</div>
                </div>
                <div class="stat">
                  <div class="stat-value">$${budget.limit.toFixed(2)}</div>
                  <div class="stat-label">Budget</div>
                </div>
                <div class="stat">
                  <div class="stat-value">$${(budget.limit - spent).toFixed(2)}</div>
                  <div class="stat-label">${spent > budget.limit ? 'Over' : 'Remaining'}</div>
                </div>
              </div>
              <p>Consider reviewing your spending in this category to stay on track with your financial goals.</p>
              <div class="footer">
                <p>This is an automated notification from Expense Tracker.</p>
                <p>You can manage your notification preferences in your account settings.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Budget alert email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending budget alert email:', error);
      return false;
    }
  }

  async sendWeeklyReport(user, reportData) {
    if (!this.transporter) {
      console.log('Email service not configured, skipping weekly report');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Expense Tracker <noreply@expensetracker.com>',
      to: user.email,
      subject: 'Your Weekly Expense Summary',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-item { text-align: center; padding: 15px; background: white; border-radius: 8px; flex: 1; margin: 0 5px; }
            .amount { font-size: 24px; font-weight: bold; }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
            .balance { color: #3b82f6; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Weekly Summary</h1>
              <p>${reportData.weekStart} - ${reportData.weekEnd}</p>
            </div>
            <div class="content">
              <p>Hi ${user.name},</p>
              <p>Here's your weekly expense summary:</p>
              <div class="summary">
                <div class="summary-item">
                  <div class="amount income">+$${reportData.totalIncome.toFixed(2)}</div>
                  <div>Income</div>
                </div>
                <div class="summary-item">
                  <div class="amount expense">-$${reportData.totalExpense.toFixed(2)}</div>
                  <div>Expenses</div>
                </div>
                <div class="summary-item">
                  <div class="amount balance">$${reportData.balance.toFixed(2)}</div>
                  <div>Net</div>
                </div>
              </div>
              ${reportData.topCategories && reportData.topCategories.length > 0 ? `
                <h3>Top Spending Categories</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${reportData.topCategories.map(cat => `
                      <tr>
                        <td>${cat.category}</td>
                        <td>$${cat.amount.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}
              <p>Keep up the great work managing your finances!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Weekly report sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending weekly report:', error);
      return false;
    }
  }

  async sendTestEmail(userEmail) {
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Expense Tracker <noreply@expensetracker.com>',
      to: userEmail,
      subject: 'Test Email - Expense Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Configuration Successful!</h2>
          <p>This is a test email from your Expense Tracker application.</p>
          <p>Your email notifications are now properly configured.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();

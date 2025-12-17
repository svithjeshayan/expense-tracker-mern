import React from 'react';
import { Shield, Check, Key, Copy, Globe, Smartphone, Download, Moon, Sun, User, FileText, X } from 'lucide-react';
import { downloadCSV } from '../utils/csvGenerator';

export default function SettingsView({
  darkMode,
  toggleDarkMode,
  userCurrency,
  handleCurrencyChange,
  currencies,
  twoFactorStatus,
  show2FASetup,
  setShow2FASetup,
  twoFASetupData,
  setTwoFASetupData,
  twoFACode,
  setTwoFACode,
  handle2FASetup,
  handle2FAVerify,
  handle2FADisable,
  backupCodes,
  showBackupCodes,
  isInstalled,
  showInstallPrompt,
  handleInstallClick,
  currentUser,
  expenses,
  loading
}) {
  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>Settings</h2>

      {/* Two-Factor Authentication */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>Two-Factor Authentication</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Add an extra layer of security to your account</p>
          </div>
        </div>

        {twoFactorStatus.enabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">2FA is enabled</span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Backup codes remaining: {twoFactorStatus.backupCodesRemaining}
            </p>
            <button
              onClick={() => {
                const password = prompt('Enter your password to disable 2FA:');
                if (password) handle2FADisable(password);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Disable 2FA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {!show2FASetup ? (
              <button
                onClick={handle2FASetup}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {loading ? 'Setting up...' : 'Enable 2FA'}
              </button>
            ) : (
              <div className="space-y-4">
                {twoFASetupData && (
                  <>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                    </p>
                    <div className="flex justify-center">
                      <img src={twoFASetupData.qrCode} alt="2FA QR Code" className="rounded-lg" />
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                      Or enter this code manually: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{twoFASetupData.secret}</code>
                    </p>
                    <form onSubmit={handle2FAVerify} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest`}
                        value={twoFACode}
                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading || twoFACode.length !== 6}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {loading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShow2FASetup(false);
                            setTwoFASetupData(null);
                            setTwoFACode('');
                          }}
                          className={`px-4 py-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-lg`}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {showBackupCodes && backupCodes.length > 0 && (
          <div className={`mt-4 p-4 ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-yellow-200'}`}>
            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>⚠️ Save Your Backup Codes</h4>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-yellow-700'}`}>
              Store these codes securely. Each can only be used once if you lose access to your authenticator.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {backupCodes.map((code, i) => (
                <code key={i} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-3 py-1 rounded text-center font-mono`}>{code}</code>
              ))}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join('\n'));
                alert('Backup codes copied to clipboard!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Copy className="w-4 h-4" />
              Copy All Codes
            </button>
          </div>
        )}
      </div>

      {/* Currency Settings */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-8 h-8 text-green-600" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>Currency Preference</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred currency for displaying amounts</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            className={`flex-1 px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
            value={userCurrency.currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            disabled={loading}
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>

        <p className={`text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Current: <span className="font-semibold">{userCurrency.symbol} {userCurrency.name}</span>
        </p>
      </div>

      {/* PWA Install */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-8 h-8 text-purple-600" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>Install App</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Install Expense Tracker as an app on your device</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">App is installed</span>
          </div>
        ) : showInstallPrompt ? (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
        ) : (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Open this app in Chrome, Edge, or Safari and look for the install option in your browser menu.
          </p>
        )}
      </div>

      {/* Theme Settings */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
        <div className="flex items-center gap-3 mb-4">
          {darkMode ? <Moon className="w-8 h-8 text-yellow-400" /> : <Sun className="w-8 h-8 text-orange-500" />}
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>Theme</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Toggle between light and dark mode</p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'} rounded-lg hover:opacity-90 transition`}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          Switch to {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {/* Account Info */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-xl shadow-sm border`}>
        <div className="flex items-center gap-3 mb-4">
          <User className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>Account</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your account information</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Name:</span> {currentUser?.name}
          </p>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Email:</span> {currentUser?.email}
          </p>
        </div>

        <button
          onClick={() => downloadCSV(expenses, `expense_export_${new Date().toISOString().slice(0, 10)}.csv`)}
          className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} text-gray-700 dark:text-gray-200 rounded-lg transition border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
        >
          <FileText className="w-4 h-4" />
          Export Data to CSV
        </button>
      </div>
    </div>
  );
}

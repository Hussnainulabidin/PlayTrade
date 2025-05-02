import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../components/userContext/UserContext';
import { userApi } from '../../api';
import './SellerSettingPage.css';

const SettingPage = () => {
  const { user, updateUser, logout } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // Profile picture state
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    newOrder: true,
    newMessage: true,
    orderDisputed: true,
    paymentUpdated: true,
    withdrawUpdates: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: user.twoFactorEnabled || false,
      });
      setPreviewUrl(user.profilePicture || null);

      // Load notification preferences from user data if available
      if (user.notificationPrefs) {
        setNotificationPrefs(user.notificationPrefs);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to optimize Cloudinary URL if needed
  const optimizeImageUrl = (url) => {
    if (!url) return null;
    // If it's already a data URL or a local image, return as is
    if (url.startsWith('data:') || url.startsWith('/')) return url;

    // If it's a Cloudinary URL, optimize it
    if (url.includes('cloudinary.com')) {
      const timestamp = new Date().getTime();
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${timestamp}&q=auto&f=auto`;
    }

    return url;
  };

  const handleProfilePictureUpload = async () => {
    if (!previewUrl) return;

    try {
      setIsLoading(true);
      const formData = new FormData();

      // Convert base64 to file if it's a data URL
      if (previewUrl.startsWith('data:')) {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
        formData.append('profilePicture', file);
      }

      const response = await userApi.updateProfilePicture(formData);

      if (response.data.success) {
        updateUser({ ...user, profilePicture: response.data.profilePicture });
        setSuccess('Profile picture updated successfully');
        setTimeout(() => {
          setSuccess(null);
          // Refresh the page to show the updated profile picture
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile picture');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setIsLoading(true);
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };

      const response = await userApi.updatePassword(passwordData);

      if (response.data.status === "success") {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setSuccess('Password updated successfully');
        setShowPasswordModal(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.toggle2FA({ enabled: !formData.twoFactorEnabled });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          twoFactorEnabled: !prev.twoFactorEnabled
        }));
        updateUser({ ...user, twoFactorEnabled: !formData.twoFactorEnabled });
        setSuccess(`Two-factor authentication ${!formData.twoFactorEnabled ? 'enabled' : 'disabled'}`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update 2FA settings');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      setLoggingOut(true);
      const response = await userApi.logoutAll();

      if (response.data.success) {
        setSuccess('Logged out from all devices. You will be redirected to login page shortly.');
        setTimeout(() => {
          logout();
          window.location.href = '/';
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log out from all devices');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleNotificationToggle = async (name) => {
    try {
      setIsLoading(true);

      // Create updated notification preferences
      const updatedPrefs = {
        ...notificationPrefs,
        [name]: !notificationPrefs[name]
      };

      // API call to update notification preferences
      const response = await userApi.updateNotificationPreferences({ preferences: updatedPrefs });

      if (response.data.success) {
        // Update local state
        setNotificationPrefs(updatedPrefs);

        // Update user context
        updateUser({ ...user, notificationPrefs: updatedPrefs });

        // Show success message
        setSuccess(`${name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} notifications ${updatedPrefs[name] ? 'enabled' : 'disabled'}`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notification preferences');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-settings-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Account settings</h1>
      </div>

      <div className="dashboard-content-container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="settings-grid">
          {/* Profile Section */}
          <div>
            <h2 className="section-title">Profile</h2>
            <div className="profile-section">
              <div className="field-row">
                <div className="field-label">Email:</div>
                <div className="field-value">
                  <div className="field-text">{user?.email}</div>
                </div>
                <div className="verified">Verified This email is linked to your account. It is not visible to other users.</div>
              </div>

              <div className="field-row">
                <div className="field-label">Username:</div>
                <div className="field-value">
                  <div className="field-text username-field">
                    {user?.username}
                    <button className="edit-btn">EDIT</button>
                  </div>
                </div>
                <div className="field-info">Name that is visible to other users. You can change your username once every 90 days.</div>
              </div>

              <div className="field-row">
                <div className="field-label">Password:</div>
                <div className="field-value">
                  <button
                    className="action-btn"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change password
                  </button>
                </div>
                <div className="field-info">Password can only be changed if you are using the email/password login flow</div>
              </div>
            </div>
          </div>

          {/* Profile Picture Section */}
          <div>
            <h2 className="section-title">Profile picture</h2>
            <div className="profile-picture-section">
              <div className="profile-picture-container">
                <div
                  className="profile-picture"
                  onClick={handleProfilePictureClick}
                  style={{
                    backgroundImage: previewUrl ? `url(${optimizeImageUrl(previewUrl)})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!previewUrl && <span>Upload</span>}
                </div>

                <div className="picture-actions">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    className="upload-btn"
                    onClick={previewUrl ? handleProfilePictureUpload : handleProfilePictureClick}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Uploading...' : 'Upload image'}
                  </button>
                  <div className="picture-info">Must be JPEG, PNG or HEIC and cannot exceed 10MB.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div>
            <h2 className="section-title">Security</h2>
            <div className="security-section">
              <div className="security-option">
                <div className="security-info">
                  <div className="security-title">Two-Factor Authentication</div>
                  <div className="security-description">
                    Add an extra layer of security to your account with two-factor authentication.
                  </div>
                </div>

                <div className="security-status">
                  <div className={`status-text ${formData.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                    {formData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  <button
                    className={`toggle-btn ${formData.twoFactorEnabled ? 'disable' : ''}`}
                    onClick={handleTwoFactorToggle}
                    disabled={isLoading}
                  >
                    {formData.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="security-option">
                <div className="security-info">
                  <div className="security-title">Log out from all sessions</div>
                  <div className="security-description">
                    This button logs you out from all devices and browsers.
                    This action can take up to 1 hour to complete.
                  </div>
                </div>

                <button
                  className="logout-btn"
                  onClick={handleLogoutAllDevices}
                  disabled={loggingOut}
                >
                  {loggingOut ? 'Logging out...' : 'Log out from all devices'}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div>
            <h2 className="section-title">Email Notifications</h2>
            <div className="notification-section">
              <div className="notification-option">
                <div className="notification-info">
                  <div className="notification-title">New Order</div>
                  <div className="notification-description">
                    Receive email notifications when you get a new order
                  </div>
                </div>

                <div className="notification-toggle">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.newOrder}
                      onChange={() => handleNotificationToggle('newOrder')}
                      disabled={isLoading}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="notification-option">
                <div className="notification-info">
                  <div className="notification-title">New Message</div>
                  <div className="notification-description">
                    Receive email notifications when you get a new message
                  </div>
                </div>

                <div className="notification-toggle">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.newMessage}
                      onChange={() => handleNotificationToggle('newMessage')}
                      disabled={isLoading}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="notification-option">
                <div className="notification-info">
                  <div className="notification-title">Order Disputed</div>
                  <div className="notification-description">
                    Receive email notifications when an order is disputed
                  </div>
                </div>

                <div className="notification-toggle">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.orderDisputed}
                      onChange={() => handleNotificationToggle('orderDisputed')}
                      disabled={isLoading}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="notification-option">
                <div className="notification-info">
                  <div className="notification-title">Payment Updated</div>
                  <div className="notification-description">
                    Receive email notifications when a payment is updated
                  </div>
                </div>

                <div className="notification-toggle">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.paymentUpdated}
                      onChange={() => handleNotificationToggle('paymentUpdated')}
                      disabled={isLoading}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="notification-option">
                <div className="notification-info">
                  <div className="notification-title">Withdraw Updates</div>
                  <div className="notification-description">
                    Receive email notifications about withdrawal status changes
                  </div>
                </div>

                <div className="notification-toggle">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.withdrawUpdates}
                      onChange={() => handleNotificationToggle('withdrawUpdates')}
                      disabled={isLoading}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="password-modal">
            <div className="password-form-container">
              <div className="form-header">
                <div className="form-title">Change your password</div>
                <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
              </div>

              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingPage; 
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FaUser, FaEnvelope, FaIdCard, FaCalendarAlt, FaBuilding, FaGraduationCap, FaUserTie, FaUserShield, FaCamera, FaUpload } from 'react-icons/fa';

const Profile = () => {
  const { currentUser, hasRole } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    studentId: '',
    graduationYear: '',
    position: '',
    bio: '',
    contactInfo: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // Make sure the token is set in the headers
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Set headers for the request
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        console.log('Fetching user profile...');
        const response = await axios.get(`http://localhost:5000/api/users/profile`, config);
        console.log('Profile data received:', response.data);

        setProfile(response.data.profile);

        // Initialize form data with profile data
        setFormData({
          name: response.data.profile.name || '',
          email: response.data.profile.email || '',
          department: response.data.profile.department || '',
          studentId: response.data.profile.student_id || '',
          graduationYear: response.data.profile.graduation_year || '',
          position: response.data.profile.position || '',
          bio: response.data.profile.bio || '',
          contactInfo: response.data.profile.contact_info || ''
        });

        // Set photo preview if available
        if (response.data.profile.profile_photo_url) {
          setPhotoPreview(response.data.profile.profile_photo_url);
        }

        setError(null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          setError(`Failed to load profile: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          setError('Failed to load profile: No response from server');
        } else {
          console.error('Error message:', error.message);
          setError(`Failed to load profile: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file.name, file.type, file.size);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }

      setPhotoFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Create FormData object for file upload
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name || '');
      formDataObj.append('department', formData.department || '');
      formDataObj.append('studentId', formData.studentId || '');
      formDataObj.append('graduationYear', formData.graduationYear || '');
      formDataObj.append('position', formData.position || '');
      formDataObj.append('bio', formData.bio || '');
      formDataObj.append('contactInfo', formData.contactInfo || '');

      // Add profile photo if selected
      if (photoFile) {
        formDataObj.append('profilePhoto', photoFile);
      }

      // Make sure the token is set in the headers
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Set headers for multipart/form-data
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('Submitting profile update...');
      const response = await axios.put('http://localhost:5000/api/users/profile', formDataObj, config);
      console.log('Profile update response:', response.data);

      setProfile(response.data.profile);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');

      // Update photo preview if available
      if (response.data.profile.profile_photo_url) {
        setPhotoPreview(response.data.profile.profile_photo_url);
      }

      // Reset file input
      setPhotoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(`Failed to update profile: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Failed to update profile: No response from server');
      } else {
        console.error('Error message:', error.message);
        setError(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && !profile) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger">
          <p>{error}</p>
          <button className="btn btn-secondary mt-2" onClick={() => setError(null)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="not-found">
        Please log in to view your profile
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and preferences</p>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-text">{currentUser.name?.charAt(0) || 'U'}</div>
            )}
            {currentUser.role === 'admin' && <FaUserShield className="profile-role-icon admin" />}
            {currentUser.role === 'organizer' && <FaUserTie className="profile-role-icon organizer" />}
            {currentUser.role === 'student' && <FaGraduationCap className="profile-role-icon student" />}
            {isEditing && (
              <div className="profile-avatar-overlay" onClick={triggerFileInput}>
                <FaCamera className="profile-avatar-camera" />
                <span>Change Photo</span>
              </div>
            )}
          </div>
          <div className="profile-title">
            <h2>{currentUser.name}</h2>
            <span className={`role-badge ${currentUser.role}`}>
              {currentUser.role}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden-file-input"
            />
            <div className="form-group">
              <label htmlFor="name">
                <FaUser className="input-icon" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled
              />
              <small className="form-text text-muted">Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="department">
                <FaBuilding className="input-icon" />
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleInputChange}
              />
            </div>

            {/* Student-specific fields */}
            {hasRole(['student']) && (
              <>
                <div className="form-group">
                  <label htmlFor="studentId">
                    <FaIdCard className="input-icon" />
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    className="form-control"
                    value={formData.studentId}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="graduationYear">
                    <FaCalendarAlt className="input-icon" />
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    id="graduationYear"
                    name="graduationYear"
                    className="form-control"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* Organizer-specific fields */}
            {hasRole(['organizer', 'admin']) && (
              <>
                <div className="form-group">
                  <label htmlFor="position">
                    <FaUserTie className="input-icon" />
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    className="form-control"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* Common fields for all roles */}
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                className="form-control"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="contactInfo">Contact Information</label>
              <textarea
                id="contactInfo"
                name="contactInfo"
                className="form-control"
                value={formData.contactInfo}
                onChange={handleInputChange}
                rows="2"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="profile-section">
              <h3>Basic Information</h3>
              <div className="profile-info-item">
                <FaUser className="profile-icon" />
                <div>
                  <strong>Name</strong>
                  <p>{profile?.name || currentUser.name}</p>
                </div>
              </div>
              <div className="profile-info-item">
                <FaEnvelope className="profile-icon" />
                <div>
                  <strong>Email</strong>
                  <p>{profile?.email || currentUser.email}</p>
                </div>
              </div>
              <div className="profile-info-item">
                <FaCalendarAlt className="profile-icon" />
                <div>
                  <strong>Joined</strong>
                  <p>{formatDate(profile?.created_at || currentUser.created_at)}</p>
                </div>
              </div>
              {profile?.department && (
                <div className="profile-info-item">
                  <FaBuilding className="profile-icon" />
                  <div>
                    <strong>Department</strong>
                    <p>{profile.department}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Student-specific information */}
            {hasRole(['student']) && profile?.student_id && (
              <div className="profile-section">
                <h3>Student Information</h3>
                <div className="profile-info-item">
                  <FaIdCard className="profile-icon" />
                  <div>
                    <strong>Student ID</strong>
                    <p>{profile.student_id}</p>
                  </div>
                </div>
                {profile.graduation_year && (
                  <div className="profile-info-item">
                    <FaCalendarAlt className="profile-icon" />
                    <div>
                      <strong>Graduation Year</strong>
                      <p>{profile.graduation_year}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Organizer-specific information */}
            {hasRole(['organizer', 'admin']) && profile?.position && (
              <div className="profile-section">
                <h3>Organizer Information</h3>
                <div className="profile-info-item">
                  <FaUserTie className="profile-icon" />
                  <div>
                    <strong>Position</strong>
                    <p>{profile.position}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bio section */}
            {profile?.bio && (
              <div className="profile-section">
                <h3>Bio</h3>
                <p className="profile-bio">{profile.bio}</p>
              </div>
            )}

            {/* Contact information */}
            {profile?.contact_info && (
              <div className="profile-section">
                <h3>Contact Information</h3>
                <p className="profile-contact">{profile.contact_info}</p>
              </div>
            )}

            <div className="profile-actions">
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

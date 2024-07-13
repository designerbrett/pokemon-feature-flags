import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

function ProfileEdit() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [biography, setBiography] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const db = getDatabase();
  const storage = getStorage();

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUsername(userData.username || '');
          setBiography(userData.biography || '');
          setImagePreview(userData.profileImage || null);
        }
      }
    };

    fetchUserData();
  }, [currentUser, db]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File size should not exceed 2MB.");
        return;
      } else {
        setError(""); // Clear the error message for valid files
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setProfileImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let profileImageUrl = imagePreview;
      if (profileImageFile) {
        const imageRef = storageRef(storage, `profileImages/${currentUser.uid}`);
        const snapshot = await uploadBytes(imageRef, profileImageFile);
        profileImageUrl = await getDownloadURL(snapshot.ref);
      }

      await set(ref(db, `users/${currentUser.uid}`), {
        username,
        biography,
        profileImage: profileImageUrl
      });

      navigate('/profile');
    } catch (error) {
      setError('Failed to update profile. ' + error.message);
    }
  };

  return (
    <div id='page-contained' className='profile-edit'>
      <h1>Edit Profile</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="biography">Biography:</label>
          <textarea
            id="biography"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="profileImage">Profile Image:</label>
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Profile Preview" className="profile-preview" width={100} />
          )}
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default ProfileEdit;
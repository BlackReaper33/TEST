import React, { useState, useEffect } from 'react';
import { Button, Input, IconButton } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentAlt } from '@fortawesome/free-solid-svg-icons'
import './ChangeUsernameAndPicture.css';
import { NavLink } from 'react-router-dom';

const ChangeUsernameAndPicture = (props) => {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const auth = firebase.auth()
  const storage = firebase.storage();

  useEffect(() => {
    // Retrieve the username from Firebase when the component mounts
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/username').once('value')
      .then((snapshot) => {
        const usernameFromFirebase = snapshot.val();
        setUsername(usernameFromFirebase || '');
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`profile-pictures/${file.name}`);
    fileRef.put(file)
      .then((snapshot) => {
        setProfilePicture(URL.createObjectURL(file));
        setError(null);
      })
      .catch((error) => {
        setProfilePicture(null);
        setError(error.message);
      });
  };
  

  const handleUsernameChange = () => {
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/username').set(username)
      .then(() => {
        setSuccess(true);
        setError(null);
      })
      .catch((error) => {
        setSuccess(false);
        setError(error.message);
      });
  };

  return (
    <div className="change-username-and-picture">
      <h2>Change username and picture</h2>
      <Input 
        type="text" 
        placeholder={username ? username : "Enter new username"} // Show the previously entered username or "Enter new username"
        value={username}
        onChange={e => {
          if (e.target.value.length <= 15) {
            setUsername(e.target.value);
            setError(null);
          } else {
            setError('Word limit is 15');
            setSuccess(false);
          }
        }}
      />
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleProfilePictureChange} 
        style={{ display: 'none' }} 
        id="upload-profile-picture"
      />
      <label htmlFor="upload-profile-picture">
        <IconButton 
          color="primary" 
          aria-label="upload picture" 
          component="span"
        >
          <ImageIcon />
        </IconButton>
      </label>
      {profilePicture && (
        <div>
          <img src={profilePicture} alt="Profile" />
        </div>
      )}
      <Button variant="contained" color="primary" onClick={handleUsernameChange}>
        Change
      </Button>
      {error && (
        <p className="error">Error: {error}</p>
      )}
      {success && (
        <p className="success">Username changed successfully!</p>
      )}
      {auth.currentUser && (<NavLink to="/sign-in-button"><p><button className="sign-out" onClick={() => auth.signOut()}>SignOut</button></p></NavLink>)}
      <span className="chat-icon">
        <NavLink to="/">
          <button className="chat-icon">
            <FontAwesomeIcon icon={faCommentAlt} />
          </button>
        </NavLink>
      </span>
      <span className="privacy-link">
        <NavLink to="/privacy-policy" target="_blank">
          Privacy Policy
        </NavLink>
      </span>
    </div>
  );
};

export default ChangeUsernameAndPicture;

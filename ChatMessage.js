import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ChatMessage = (props) => {
  const { text, uid, fileUrl } = props.message;
  const messageClass = uid === firebase.auth().currentUser.uid ? 'sent' : 'received';

  const [username, setUsername] = useState(null);
  const [taggedText, setTaggedText] = useState(null);

  const handleDeleteClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (confirmed) {
      const db = firebase.firestore();
      await db.collection("messages").doc(props.id).delete();
    }
  };

  useEffect(() => {
    const fetchUsernameAndTaggedText = async () => {
      const usernameSnapshot = await firebase.database().ref(`users/${uid}/username`).once('value');
      const usernameData = usernameSnapshot.val();
      if (usernameData) {
        setUsername(usernameData);
      } else {
        setUsername(firebase.auth().displayName);
      }
    
      const tagRegex = /@([\w\s]+)/g;
      const matches = text ? text.match(tagRegex) : null;
      if (matches) {
        const replacedMatches = await Promise.all(matches.map(async (match) => {
          const username = match.trim().substring(1);
          const userRef = firebase.database().ref(`users`).orderByChild('username').equalTo(username);
          const snapshot = await userRef.once('value');
          const user = snapshot.val();
          if (user) {
            const uid = Object.keys(user)[0];
            return uid;
          } else {
            return null;
          }
        }));
        let currentIndex = 0;
        const newTaggedText = text.replace(tagRegex, (match) => {
          const uid = replacedMatches[currentIndex++];
          if (uid) {
            return `<a href="/profile/${uid}" style="color: blue;">${match}</a>`;
          } else {
            return match;
          }
        });        
        const linkRegex = /(?:^|[^"'])(https?:\/\/[^\s"]+)(?=["']|$)/g;
        const newLinkedText = newTaggedText.replace(linkRegex, (match) => {
          return `<a href="${match}" style="color: blue;" target="_blank">${match}</a>`;
        });
        setTaggedText(newLinkedText);
      } else {
        const linkRegex = /(?:^|[^"'])(https?:\/\/[^\s"]+)(?=["']|$)/g;
        const newLinkedText = text ? text.replace(linkRegex, (match) => {
          return `<a href="${match}" style="color: blue;" target="_blank">${match}</a>`;
        }) : null;
        if (newLinkedText !== text) {
          setTaggedText(newLinkedText);
        } else {
          setTaggedText(text);
        }
      }
    }
      fetchUsernameAndTaggedText();
    }, [uid, text, taggedText]);
  
    const usernameClass = messageClass === 'sent' ? 'username-sent' : 'username-received';
    const [showDelete, setShowDelete] = useState(false);
  
    const showDeleteButton = () => {
      if (uid === firebase.auth().currentUser.uid) {
        setShowDelete(true);
      }
    };
  
    const hideDeleteButton = () => {
      setShowDelete(false);
    };
    
        return (
          <div
            className={`message ${messageClass}`}
            onMouseEnter={showDeleteButton}
            onMouseLeave={hideDeleteButton}
          >
            <div className="message-content">
              {username && taggedText && (
                <p
                  className="message-text"
                  dangerouslySetInnerHTML={{
                    __html: `<span class="${usernameClass}">${username}: </span>${taggedText}`
                  }}
                />
              )}
              {fileUrl && (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <img src={fileUrl} alt="chat attachment" className="message-image-preview" />
                </a>
              )}
            </div>
            {showDelete && (
              <button className="delete-button" onClick={handleDeleteClick}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        );
        
      };
  
export default ChatMessage
import React, { useRef, useState,useEffect } from 'react';
// import uuid from "react-uuid";
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { getDocs,addDoc, collection, getFirestore, initializeFirestore } from "firebase/firestore";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import Sidebar from './sidebar';
import Main from './main';

const app = firebase.initializeApp({
  apiKey: "AIzaSyCuNpyMiaj1O9EfJPbghHq8e19uIIYttHg",
  authDomain: "chattest-f7851.firebaseapp.com",
  projectId: "chattest-f7851",
  storageBucket: "chattest-f7851.appspot.com",
  messagingSenderId: "377826863992",
  appId: "1:377826863992:web:10f2b7082875d2f83df68d",
  measurementId: "G-RL3QJ5688E"
})

const db = getFirestore(app)
const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);
  console.log(localStorage.notes);
  // const [notes, setNotes] = useState(
  //   localStorage.notes ? JSON.parse(localStorage.notes) : []
  // );
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(false);
  const getNotes = async () => {
    const data = await getDocs(postsCollectionRef);
    setNotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };
  getNotes();
  useEffect(() => {
    
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);


  const postsCollectionRef = collection(db, "posts");

  if (user){
  
    const onAddNote = async () => {
      const newNote = {
        id: auth.currentUser.uid+Date.now(),
        title: "Untitled Note",
        body: "",
        author:{ name: auth.currentUser.displayName, id: auth.currentUser.uid },
        lastModified: Date.now(),
        
      };
      setNotes([newNote, ...notes]);
      setActiveNote(newNote.id);
      console.log(newNote.id);
      await addDoc(postsCollectionRef, newNote);
      
    };
  
    const onDeleteNote = (noteId) => {
      setNotes(notes.filter(({ id }) => id !== noteId));
    };
  
    const onUpdateNote = (updatedNote) => {
      const updatedNotesArr = notes.map((note) => {
        if (note.id === updatedNote.id) {
          return updatedNote;
        }
  
        return note;
      });
  
      setNotes(updatedNotesArr);
    };
    
    const getActiveNote = () => {
      return notes.find(({ id }) => id === activeNote);
    };

  
    return (
      <div className="App">
        <Sidebar
          notes={notes}
          onAddNote={onAddNote}
          onDeleteNote={onDeleteNote}
          activeNote={activeNote}
          setActiveNote={setActiveNote}
        />
        <Main activeNote={getActiveNote()} onUpdateNote={onUpdateNote} />
        <SignOut />
      </div>
    );

  }
  return (
    <div className="App">
      <header>
        <h1>Welcome to our notebook app!</h1>
        {/* <SignOut /> */}
      </header>

      <section>
        <SignIn />
      </section>

    </div>
  );
  
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Sign in to view and modify your notes.</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


export default App;
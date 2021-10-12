import auth, { FirebaseAuthTypes, firebase } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { createContext } from 'react';
import { Alert } from 'react-native';

import { UserDataModel } from '../models/user';
import { STATES } from '../constants';
import { PostModel } from '../models/post';

class User {
  constructor() {
    auth().onAuthStateChanged((user: FirebaseAuthTypes.User | null) => this.onAuthStateChanged(user));
    auth().onUserChanged((user) => this.onAuthStateChanged(user));
    makeObservable(this, {
      state: observable,
      user: observable,
      isAdmin: observable,
      posts: observable,
      userData: observable,
      onAuthStateChanged: action,
      loadPosts: action,
      promote: action,
      addBadge: action,
    });
  }

  user: FirebaseAuthTypes.User | null = null;
  userData: UserDataModel | FirebaseFirestoreTypes.DocumentData | null | undefined = null;
  posts: Array<PostModel> = [];
  isAdmin = false;
  state = STATES.IDLE;

  onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    this.user = user;
    if (user) {
      firestore()
        .collection('Users')
        .doc(user.uid)
        .get()
        .then((data) => {
          runInAction(() => {
            this.userData = data.data();
          });
        });
    } else {
      this.userData = null;
      this.isAdmin = false;
    }
    this.state = STATES.SUCCESS;
  }

  promote() {
    this.isAdmin = true;
  }

  async loadPosts() {
    this.state = STATES.LOADING;
    const snapshot = await firestore().collection('Posts').where('user.id', '==', this.user?.uid).orderBy('timestamp', 'desc').get();
    const newPosts: PostModel[] = [];
    snapshot.forEach((doc) => {
      newPosts.push({ ...(doc.data() as PostModel), id: doc.id });
    });
    runInAction(() => {
      this.state = STATES.SUCCESS;
      this.posts = [...newPosts];
    });
  }

  addBadge(badge: string) {
    if (!this.userData) return;

    const badges: string[] | undefined = this.userData.badges;
    if (badges && badges.includes(badge)) {
      const badgesRef = firestore().collection('Users').doc(this.user?.uid);
      badgesRef
        .update({
          badges: firebase.firestore.FieldValue.arrayUnion(badge),
        })
        .then(() => Alert.alert('Congrats! 🎉', 'You’ve earned a brand new badge for your participation in this month challenge!'));
      badges.push(badge);
      this.userData.badges = badges;
    }
  }
}

export default createContext(new User());

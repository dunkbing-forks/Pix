import { makeObservable, observable, action, runInAction } from 'mobx';
import { createContext } from 'react';
import { Alert } from 'react-native';
import { MONTHS, STATES } from '../constants';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/auth';

const PAGE_ITEMS = 5;

class Challenge {
  constructor() {
    makeObservable(this, {
      state: observable,
      currentChallenge: observable,
      challenges: observable,
      sort: observable,
      likePost: action,
      loadChallenges: action,
      loadCurrentChallenge: action,
      loadMore: action,
      changeSort: action,
      clearChallenges: action,
    });
  }

  challenges: { id: string, likes: any, likesCount: number }[] = [];
  currentChallenge: FirebaseFirestoreTypes.DocumentData | null = null;
  lastSnapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null = null;
  sort: 'timestamp' | 'likesCount' = 'timestamp';
  state = STATES.IDLE;

  async loadCurrentChallenge() {
    const currentMonth = MONTHS[new Date().getMonth()];
    const challengesData = await firestore().collection('Challenges').get();
    if (challengesData.empty) {
      this.state = STATES.ERROR;
    }
    challengesData.forEach((challenge) => {
      if (challenge.id === currentMonth) {
        runInAction(() => {
          this.currentChallenge = challenge.data();
        });
      }
    });
  }

  async loadChallenges() {
    this.state = STATES.LOADING;
    console.log('loading for challenge', this.currentChallenge);
    try {
      const snapshot = await firestore()
        .collection('Posts')
        .where('tag', '==', this.currentChallenge?.id)
        .orderBy(this.sort, 'desc')
        .limit(PAGE_ITEMS)
        .get();
      const newChallenges: any[] = [];
      snapshot.forEach((doc) => {
        newChallenges.push({ ...doc.data(), id: doc.id });
      });
      this.lastSnapshot = snapshot.docs[snapshot.docs.length - 1];
      runInAction(() => {
        this.state = STATES.SUCCESS;
        this.challenges = [...newChallenges];
      });
    } catch (err) {
      console.log('ERr!!', err);
      runInAction(() => {
        this.state = STATES.ERROR;
      });
    }
  }

  async loadMore() {
    if (this.state !== STATES.LOADING && this.state !== STATES.LOADING_BACKGROUND && this.lastSnapshot) {
      this.state = STATES.LOADING_BACKGROUND;
      try {
        const snapshot = await firestore()
          .collection('Posts')
          .where('tag', '==', this.currentChallenge?.id)
          .orderBy(this.sort, 'desc')
          .startAfter(this.lastSnapshot)
          .limit(PAGE_ITEMS)
          .get();

        const newFeed: any[] = [];
        snapshot.forEach((doc) => {
          newFeed.push({ ...doc.data(), id: doc.id });
        });
        this.lastSnapshot = snapshot.docs[snapshot.docs.length - 1];
        runInAction(() => {
          this.state = STATES.SUCCESS;
          this.challenges = [...this.challenges, ...newFeed];
        });
      } catch (err) {
        console.log('err', err);
        runInAction(() => {
          this.state = STATES.ERROR;
        });
      }
    }
  }

  async likePost(postId: string, userId: string, likes: Array<any>) {
    const likesRef = firestore().collection('Posts').doc(postId);
    if (likes.includes(userId)) {
      likesRef.update({
        likes: firebase.firestore.FieldValue.arrayRemove(userId),
        likesCount: firebase.firestore.FieldValue.increment(-1),
      });
    } else {
      likesRef.update({
        likes: firebase.firestore.FieldValue.arrayUnion(userId),
        likesCount: firebase.firestore.FieldValue.increment(1),
      });
    }
    const newPostData = await firestore().collection('Posts').doc(postId).get();
    runInAction(() => {
      this.challenges[this.challenges.findIndex((i) => i.id === postId)].likes = newPostData.data()?.likes;
      this.challenges[this.challenges.findIndex((i) => i.id === postId)].likesCount = newPostData.data()?.likesCount;
    });
  }

  changeSort(newSort: 'timestamp' | 'likesCount') {
    this.sort = newSort;
  }

  clearChallenges() {
    this.challenges = [];
    this.lastSnapshot = null;
  }

  async reportPost(postId: string) {
    const postRef = firestore().collection('Posts').doc(postId);
    await postRef.update({
      reports: firebase.firestore.FieldValue.increment(1),
    });
    Alert.alert('Thank you for your report!', 'You are making the App a friendlier place for everyone.');
  }
}

export default createContext(new Challenge());

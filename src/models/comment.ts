import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface CommentModel {
  text: string;
  timestamp: number;
  userRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
}

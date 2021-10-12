import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { CommentModel } from './models/comment';

export enum Themes {
  automatic,
  light,
  dark,
}

export interface Pixel {
  color: string;
}

export type RootStackParamList = {
  PostDetails: {
    id: number;
    comments: CommentModel[];
  };
  EditorModal: undefined;
};

export type License = {
  licenses: string;
  repository: string;
  publisher: string;
  email: string;
  path: string;
  licenseFile: string;
};

export type RootStackProps = StackNavigationProp<RootStackParamList>;

import { CommentModel } from './comment';
import { PixelModel } from './pixel';
import { UserDataModel } from './user';

export type PostData = {
  backgroundColor: string;
  pixels: PixelModel[];
  desc: string;
};

export type PostModel = {
  id: string;
  comments: CommentModel[];
  data: PostData;
  likes: string[];
  likeCount: number;
  tag: any;
  timestamp: number;
  user: Pick<UserDataModel, 'avatar' | 'displayName'>;
};

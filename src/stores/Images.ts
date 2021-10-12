import { makeObservable, observable, action, runInAction } from 'mobx';
import { createContext } from 'react';
import { STATES } from '../constants';
import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';

type Avatar = {
  cloudPath: string;
  category: string;
  url: string;
};

class Images {
  constructor() {
    makeObservable(this, {
      state: observable,
      avatars: observable,
      loadAvatarsURLs: action,
    });
  }

  state = STATES.IDLE;
  avatars: { [key: string]: Avatar } = {};

  avatarPaths: string[] = [];

  async listFilesAndDirectories(reference: FirebaseStorageTypes.Reference, pageToken?: string): Promise<void> {
    const result = await reference.list({ pageToken });
    result.items.forEach((ref) => {
      // Only store avatar paths (needed for profile edition)
      if (ref.fullPath.includes('avatars')) {
        console.log(ref.fullPath)
        this.avatarPaths.push(ref.fullPath);
      }
    });
    if (result.nextPageToken) {
      return this.listFilesAndDirectories(reference, result.nextPageToken);
    }
    return await Promise.resolve();
  }

  async loadAvatarsURLs(): Promise<void> {
    const reference = storage().ref('avatars');
    await this.listFilesAndDirectories(reference);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.avatarPaths.forEach(async (avatarPath) => {
      const name = avatarPath.substring(avatarPath.lastIndexOf('/') + 1, avatarPath.lastIndexOf('.'));
      const url = await storage().ref(avatarPath).getDownloadURL();

      const avatarData: Avatar = {
        cloudPath: avatarPath,
        category: `${avatarPath.substring(avatarPath.lastIndexOf('/') + 1, avatarPath.lastIndexOf('-'))}s`,
        url,
      };
      runInAction(() => {
        this.avatars[name] = avatarData;
      });
    });
  }
}

export default createContext(new Images());

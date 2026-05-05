import { flag } from 'flags/next';

export const showNewFeature = flag<boolean>({
  key: 'show-new-feature',
  defaultValue: false,
  decide() {
    return false;
  },
});

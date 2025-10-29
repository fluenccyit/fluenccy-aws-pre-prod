import { useAuth } from '@client/auth';
import { useFeature } from '@client/common';

export const useIsMarkupVisible = () => {
  const { firebaseUser } = useAuth();
  const { isEnabledByEmail } = useFeature();

  if (!firebaseUser?.email) {
    return true;
  }

  return !isEnabledByEmail('ff_markup_hidden_by_email', firebaseUser.email);
};

import React, { FormEvent, memo, useState } from 'react';
import { map, some, split, trim } from 'lodash';
import { useHistory } from 'react-router-dom';
import { useMutationAdmin } from '@client/admin';
import { authService, AUTH_ROUTES } from '@client/auth';
import { GqlAdminCreateSuperuserInput, GqlUserRole } from '@graphql';
import {
  APOLLO_ERROR_MESSAGE,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Page,
  PageContent,
  Select,
  SelectOption,
  Text,
  TextArea,
  utilService,
} from '@client/common';

export const ROLE_OPTIONS: SelectOption<GqlUserRole>[] = [
  {
    label: 'Account Owner',
    value: 'accountowner',
  },
  {
    label: 'Super User',
    value: 'superuser',
  },
  {
    label: 'Super Dealer',
    value: 'superdealer',
  }
];

export const AdminInvitePage = memo(() => {
  const history = useHistory();
  const { adminInviteUsers, adminCreateSuperuser } = useMutationAdmin();
  const [formError, setFormError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState<GqlUserRole>('accountowner');
  const [adminFormData, setAdminFormData] = useState({ emails: '' });
  const [superuserFormData, setSuperuserFormData] = useState<GqlAdminCreateSuperuserInput>({
    email: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSent(false);
    setIsSaving(true);
    setFormError('');

    try {
      if (userRole === 'superuser') {
        await adminCreateSuperuser({ variables: { input: superuserFormData } });
        await authService.sendResetPasswordEmail(superuserFormData.email);
      } else {
        const emails = map(split(adminFormData.emails, ','), trim);
        const containsInvalidEmail = some(emails, (email) => !utilService.isValidEmail(email));

        if (containsInvalidEmail) {
          setFormError('Please use a valid email format.');
          setIsSaving(false);
          return;
        }

        await adminInviteUsers({ variables: { input: { emails } } });
      }

      setIsSent(true);
      setIsSaving(false);
    } catch ({ message }) {
      if (message === APOLLO_ERROR_MESSAGE.authenticationFailed) {
        history.push(AUTH_ROUTES.login);
      } else {
        setFormError(message);
        setIsSaving(false);
      }
    }
  };

  return (
    <Page>
      <PageContent className="min-h-screen" isCentered>
        <Card className="w-96 mt-6">
          <CardContent className="p-6">
            {Boolean(formError) && (
              <Text className="text-sm mb-4" variant="danger" isBlock>
                {formError}
              </Text>
            )}
            {Boolean(isSent) && (
              <Text className="text-sm mb-4" variant="success" isBlock>
                Emails sent!
              </Text>
            )}
            <form onSubmit={handleSubmit}>
              <Label>Role</Label>
              <Select
                className="mt-2"
                options={ROLE_OPTIONS}
                value={userRole}
                onChange={(role) => setUserRole(role as GqlUserRole)}
                isDisabled={isSaving}
                isRequired
              />
              {userRole === 'accountowner' || userRole === 'superdealer' && (
                <>
                  <Label className="mt-4">Emails to invite (Comma separated)</Label>
                  <TextArea
                    className="mt-2"
                    value={adminFormData.emails}
                    onChange={({ target }) => setAdminFormData({ ...adminFormData, emails: target.value })}
                    isDisabled={isSaving}
                    rows={10}
                    isRequired
                  />
                </>
              )}
              {userRole === 'superuser' && (
                <>
                  <Label className="mt-4">Email</Label>
                  <Input
                    value={superuserFormData.email}
                    onChange={({ target }) => setSuperuserFormData({ ...superuserFormData, email: target.value })}
                    type="email"
                    isDisabled={isSaving}
                    isRequired
                  />
                  <Label className="mt-4">First name</Label>
                  <Input
                    value={superuserFormData.firstName}
                    onChange={({ target }) => setSuperuserFormData({ ...superuserFormData, firstName: target.value })}
                    isDisabled={isSaving}
                    isRequired
                  />
                  <Label className="mt-4">Last name</Label>
                  <Input
                    value={superuserFormData.lastName}
                    onChange={({ target }) => setSuperuserFormData({ ...superuserFormData, lastName: target.value })}
                    isDisabled={isSaving}
                    isRequired
                  />
                </>
              )}
              <Button className="mt-4 w-full" type="submit" isDisabled={isSaving} isRounded>
                Send invites
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageContent>
    </Page>
  );
});

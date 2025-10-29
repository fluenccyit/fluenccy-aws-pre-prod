import React, { useEffect, memo, useState } from 'react';
import cn from 'classnames';
import { useAnalytics, Text, Label, Input, Select, Button, Card, CardContent, useToast, localStorageService } from '@client/common';
import { useMutationAccount, ACCOUNT_TYPE_OPTIONS, useQueryLocalAccount } from '@client/account';

import { useQueryLocalUser} from '@client/user';
import axios from 'axios';

const BASE_CLASSES = ['w-full', 'px-5', 'pb-5'];

export const Profile = ({ className = '' }) => {
  const classes = cn(className, BASE_CLASSES);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    accountType: 'accountant',
    accountName: '',
    firebaseUid: '',
    id: '',
    email: '',
    accountId: ''
  });
  const { account: localAccount } = useQueryLocalAccount();
  const { user: localUser } = useQueryLocalUser();
  const { addToast } = useToast();
  
  useEffect(() => {
    const { name: accountName, type: accountType, id: accountId } = localAccount;
    const { firstName, lastName, email, id, firebaseUid } = localUser;
    setFormData({accountName, firstName, lastName, accountType, email, id, firebaseUid, accountId});
  }, [localAccount, localUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError('');
    setIsSaving(true);

    const { firstName, lastName, accountType, accountName: companyName, id, firebaseUid, accountId } = formData;
    const payload = { firstName, lastName, type: accountType, name: companyName, id, firebaseUid, accountId };

    try {
      const url = "/api/profile/edit-profile";
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        'authorization': token,
      }
      axios
        .post(url, payload, {
          headers: headers
        })
        .then((res) => {
          openNotificationWithIcon("success", "", "Successfully updated.")
          setIsSaving(false);
        }).catch(e => {
          console.log(e);
          setIsSaving(false);
          openNotificationWithIcon("danger", "Error", "Error in saving profile.")
        });
    } catch (e) {
      console.error(e);
      setIsSaving(false);
      openNotificationWithIcon("danger", "Error", "Error in saving profile.")
    }
  };

  const openNotificationWithIcon = (type = "success", title = "", description = "Success", style = {}) => {
    addToast(description, type);
  };

  return (
    <Card className="w-96 mt-6">
      <CardContent className="p-6">
        <form className={classes} onSubmit={handleSubmit}>
          {Boolean(formError) && (
            <Text className="text-center text-sm mb-4" variant="danger" isBlock>
              {formError}
            </Text>
          )}
          <Label>First name</Label>
          <Input
            value={formData.firstName}
            onChange={({ target }) => setFormData({ ...formData, firstName: target.value })}
            isDisabled={isSaving}
            isRequired
          />
          <Label className="mt-4">Last name</Label>
          <Input
            value={formData.lastName}
            onChange={({ target }) => setFormData({ ...formData, lastName: target.value })}
            isDisabled={isSaving}
            isRequired
          />
          <Label className="mt-4">I am:</Label>
          <Select
            className="mt-2"
            options={ACCOUNT_TYPE_OPTIONS}
            value={formData.accountType}
            onChange={(accountType) => {
              return setFormData({ ...formData, accountName: '', accountType: accountType });
            }}
            isDisabled={isSaving}
            isRequired
          />

          {formData.accountType === 'accountant' && (
            <>
              <Label className="mt-4">Company name</Label>
              <Input
                value={formData.accountName}
                onChange={({ target }) => setFormData({ ...formData, accountName: target.value })}
                isDisabled={isSaving}
                isRequired
              />
            </>
          )}
          <Label className="mt-4">Email</Label>
          <Input
            value={formData.email}
            onChange={({ target }) => setFormData({ ...formData, email: target.value })}
            type="email"
            autoComplete="username"
            isDisabled
            isRequired
          />

          <Button className="mt-4 w-full" type="submit" data-testid="flnc-submit-button" isDisabled={isSaving} isRounded>
            Update
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
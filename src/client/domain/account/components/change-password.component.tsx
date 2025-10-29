import React, { useState } from 'react';

import { Button, Card, CardContent, Input, Label, Text, localStorageService, useToast } from '@client/common';
import { useQueryLocalUser} from '@client/user';
import axios from 'axios';

const initialState = { currentPassword: '', confirmPassword: '', password: '' };

export const ChangePassword = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(initialState);
  const { addToast } = useToast();
  const { user: localUser } = useQueryLocalUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, confirmPassword, password } = formData;
    if (!currentPassword || !confirmPassword || !password) {
      openNotificationWithIcon("danger", "Error", "All fields are mandatory.");
      return;
    }
    if (password !== confirmPassword) {
      openNotificationWithIcon("danger", "Error", "Password and confirm password should be match.");
      return;
    }
    setFormError('');
    setIsSaving(true);
    const payload = { currentPassword, newPassword: password, firebaseUid: localUser.firebaseUid };

    try {
      const url = "/api/profile/reset-password";
      const token = localStorageService.getItem('firebase-token');
      const headers = {
        'authorization': token,
      }
      axios
        .post(url, payload, {
          headers: headers
        })
        .then((res) => {
          openNotificationWithIcon("success", "", "Password Successfully Changed.");
          setFormData(initialState);
          setIsSaving(false);
        }).catch(e => {
          console.log(e);
          setIsSaving(false);
          openNotificationWithIcon("danger", "Error", "Error in upading password.")
        });
    } catch (e) {
      console.error(e);
      setIsSaving(false);
      openNotificationWithIcon("danger", "Error", "Error in upading password.")
    }
  };

  const openNotificationWithIcon = (type = "success", title = "", description = "Success", style = {}) => {
    addToast(description, type);
  };

  return (
    <Card className="w-96 mt-6">
      <CardContent className="p-6">
        {Boolean(formError) && (
          <Text className="text-sm mb-4" variant="danger" isBlock>
            {formError}
          </Text>
        )}
        <form onSubmit={handleSubmit}>
          <Label>Current Password *</Label>
          <Input
            className="mb-4"
            value={formData.currentPassword}
            onChange={({ target }) => setFormData({ ...formData, currentPassword: target.value })}
            type="password"
            autoComplete="off"
            isDisabled={isSaving}
            isRequired
          />

          <Label>New Password *</Label>
          <Input
            className="mb-4"
            value={formData.password}
            onChange={({ target }) => setFormData({ ...formData, password: target.value })}
            type="password"
            isDisabled={isSaving}
            isRequired
          />
          <Label>Confirm Password *</Label>
          <Input
            className="mb-4"
            value={formData.confirmPassword}
            onChange={({ target }) => setFormData({ ...formData, confirmPassword: target.value })}
            type="password"
            isDisabled={isSaving}
            isRequired
          />
          <Button className="mt-4 w-full" type="submit" data-testid="flnc-submit-button" isDisabled={isSaving} isRounded>
            Update
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
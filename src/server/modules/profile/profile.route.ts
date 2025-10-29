import express from 'express';
import ProfileController from '../profile/profile.controller';

const objProfiles = new ProfileController();
const routerProfiles = express();

routerProfiles.post('/edit-profile', (req, res) => {
    objProfiles.editProfile(req, res);
});

routerProfiles.post('/reset-password', (req, res) => {
    objProfiles.resetPassword(req, res);
});

export default routerProfiles;
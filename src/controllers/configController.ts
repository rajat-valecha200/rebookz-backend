import { Request, Response } from 'express';
import Config from '../models/Config';

// Get App Settings including Region and Version Controls
export const getAppSettings = async (req: Request, res: Response) => {
    try {
        const { os, version } = req.query;

        // Fetch Regions
        let regionsConfig = await Config.findOne({ key: 'regions' });
        if (!regionsConfig) {
            // Seed default if not exists
            regionsConfig = await Config.create({
                key: 'regions',
                value: [
                    { countryCode: 'SA', name: 'Saudi Arabia', currencySymbol: 'SAR', isActive: true },
                    { countryCode: 'IN', name: 'India', currencySymbol: '₹', isActive: false }
                ],
                description: 'Active regions and their localized data'
            });
        }

        // Fetch Version Controls for Dummy Login
        let versionConfig = await Config.findOne({ key: 'versionControls' });
        if (!versionConfig) {
            versionConfig = await Config.create({
                key: 'versionControls',
                value: [
                    { os: 'ios', version: '1.0.1', allowDummy: true },
                    { os: 'ios', version: '1.0.2', allowDummy: false }
                ],
                description: 'Version specific access to dummy login'
            });
        }

        // Fetch Force Update configuration
        let forceUpdateConfig = await Config.findOne({ key: 'forceUpdate' });
        if (!forceUpdateConfig) {
            forceUpdateConfig = await Config.create({
                key: 'forceUpdate',
                value: {
                    ios: { requiredVersion: '1.0.0', storeUrl: '' },
                    android: { requiredVersion: '1.0.0', storeUrl: '' }
                },
                description: 'Force update required versions and store URLs'
            });
        }

        // Determine if dummy login is allowed for this specific OS and Version
        let allowDummyLogin = false; // Default off
        if (os && version) {
            const rule = versionConfig.value.find((v: any) => v.os === os && v.version === version);
            if (rule) {
                allowDummyLogin = rule.allowDummy;
            }
        }

        res.json({
            regions: regionsConfig.value,
            versionControls: versionConfig.value,
            forceUpdate: forceUpdateConfig.value,
            allowDummyLogin
        });

    } catch (error) {
        console.error('Error fetching app settings:', error);
        res.status(500).json({ message: 'Server error fetching settings' });
    }
};

// Update App Settings (Admin Only)
export const updateAppSettings = async (req: Request, res: Response) => {
    try {
        const { regions, versionControls, forceUpdate } = req.body;

        if (regions) {
            await Config.findOneAndUpdate({ key: 'regions' }, { value: regions }, { upsert: true });
        }

        if (versionControls) {
            await Config.findOneAndUpdate({ key: 'versionControls' }, { value: versionControls }, { upsert: true });
        }

        if (forceUpdate) {
            await Config.findOneAndUpdate({ key: 'forceUpdate' }, { value: forceUpdate }, { upsert: true });
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating app settings:', error);
        res.status(500).json({ message: 'Server error updating settings' });
    }
};

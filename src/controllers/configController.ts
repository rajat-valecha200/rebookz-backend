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
                    { countryCode: 'IN', name: 'India', currencySymbol: '₹', isActive: true },
                    { countryCode: 'US', name: 'United States', currencySymbol: '$', isActive: false }
                ],
                description: 'Active regions and their localized data'
            });
        } else {
            // Ensure US exists in existing data
            const regions = regionsConfig.value;
            if (!regions.find((r: any) => r.countryCode === 'US')) {
                regions.push({ countryCode: 'US', name: 'United States', currencySymbol: '$', isActive: false });
                await Config.findOneAndUpdate({ key: 'regions' }, { value: regions });
                regionsConfig.value = regions;
            }
        }

        // Fetch OS-specific Allowed Regions
        let allowedRegionsConfig = await Config.findOne({ key: 'allowedRegions' });
        if (!allowedRegionsConfig) {
            allowedRegionsConfig = await Config.create({
                key: 'allowedRegions',
                value: {
                    android: ['SA', 'IN'], // Android allows both
                    ios: ['SA'],           // iOS only Saudi Arabia
                    web: ['SA', 'IN']
                },
                description: 'List of country codes allowed per platform'
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

        // Filter active regions based on OS if provided
        let availableRegions = regionsConfig.value;
        if (os && allowedRegionsConfig.value[os as string]) {
            const allowedList = allowedRegionsConfig.value[os as string];
            availableRegions = availableRegions.map((reg: any) => ({
                ...reg,
                isActive: reg.isActive && allowedList.includes(reg.countryCode)
            }));
        }

        res.json({
            regions: availableRegions,
            versionControls: versionConfig.value,
            forceUpdate: forceUpdateConfig.value,
            allowedRegions: allowedRegionsConfig.value, // Return raw allowed regions for Admin
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
        const { regions, versionControls, forceUpdate, allowedRegions } = req.body;

        if (regions) {
            await Config.findOneAndUpdate({ key: 'regions' }, { value: regions }, { upsert: true });
        }

        if (versionControls) {
            await Config.findOneAndUpdate({ key: 'versionControls' }, { value: versionControls }, { upsert: true });
        }

        if (forceUpdate) {
            await Config.findOneAndUpdate({ key: 'forceUpdate' }, { value: forceUpdate }, { upsert: true });
        }

        if (allowedRegions) {
            await Config.findOneAndUpdate({ key: 'allowedRegions' }, { value: allowedRegions }, { upsert: true });
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating app settings:', error);
        res.status(500).json({ message: 'Server error updating settings' });
    }
};

import { Expo } from 'expo-server-sdk';
import User from '../models/User';

let expo = new Expo();

export const sendPushNotification = async (userIds: string[], message: string, data: any = {}) => {
    try {
        const users = await User.find({ _id: { $in: userIds } }).select('pushToken');
        const tokens = users.map(u => u.pushToken).filter(t => Expo.isExpoPushToken(t));

        if (tokens.length === 0) return;

        let messages = [];
        for (let pushToken of tokens) {
            if (!pushToken) continue;
            messages.push({
                to: pushToken,
                sound: 'default',
                body: message,
                data: data,
            });
        }

        let chunks = expo.chunkPushNotifications(messages as any);
        for (let chunk of chunks) {
            try {
                await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
                console.error('Error sending chunk', error);
            }
        }
    } catch (error) {
        console.error('Error sending push notification', error);
    }
};

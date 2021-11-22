import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import Connection from '../db/Connection';
import User from '../db/User';

const jwtSecret = 'rBNpKpmAbWnQGWzX7QWXpyvYW2r3uacFxurLgss73ZcHGaPe49eJCf8QnQUS9DMw';

export const generateToken = (username: string): string => {
    return jsonwebtoken.sign({ username }, jwtSecret, { algorithm: 'HS256' });
};

export const authenticateToken = async (token: string): Promise<User | null> => {
    try {
        const decoded = jsonwebtoken.verify(token, jwtSecret, { algorithm: 'HS256' });
        const user = await new Promise((resolve) => {
            User.findOne({ username: decoded.username }, (err, result) => {
                if (err) {
                    console.error(err);
                    resolve(null);
                } else {
                    resolve(result);
                }
            })
        });
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

const salt = '$2b$10$00Kh2SFr5E5K9wAXoKRpVu';

export const generateBcrypt = (toEncrypt: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(toEncrypt, salt, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

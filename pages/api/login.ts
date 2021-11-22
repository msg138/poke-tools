// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import '../../db/Connection';
import User, { UserType } from '../../db/User';
import { generateToken, generateBcrypt } from '../../utility/authentication';

type Data = {
    token?: string
    message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    if (req.method === 'POST') {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            res.status(403).json({ message: 'Username and Password required.' });
        } else {
            const encryptedPassword = await generateBcrypt(password);
            try {
                const user: UserType = await new Promise((resolve, reject) => {
                    User.findOne({ username }, (err, user) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(user);
                        }
                    })
                })
                if (user && user.password === encryptedPassword) {
                    res.status(200).json({ message: 'Logged in successfully!', token: generateToken(username) });
                } else {
                    res.status(403).json({ message: 'No user found.' });
                }
            } catch (e) {
                console.error(e);
                res.status(503).json({ message: 'Error occurred on server.' });
            }
        }
    } else {
        res.status(403).json({ message: 'Invalid Method.' });
    }
}

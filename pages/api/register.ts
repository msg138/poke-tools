import type { NextApiRequest, NextApiResponse } from 'next';
import '../../db/Connection';
import User, { UserType } from '../../db/User';
import { generateBcrypt } from '../../utility/authentication';

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
      const existingUser: UserType = await new Promise((resolve, reject) => {
        User.findOne({ username }, (err, user) => {
          if (err) {
            console.error('err', err);
            reject(err);
          } else {
            resolve(user);
          }
        });
      })
      if (existingUser) {
        res.status(403).json({ message: 'Username already exists!' });
      } else {
        const encryptedPassword = await generateBcrypt(password);
        const defaultTeam = {
          name: 'Default',
          generation: 1,
          members: [],
          settings: {},
        };
        const newUser = new User({ 
          username,
          password: encryptedPassword,
          teams: [defaultTeam],
          currentTeam: 0,
        });
        await newUser.save();
        console.log('Created new user', username);
        res.status(200).json({ message: 'User created!' });
      }
    }
  } else {
    res.status(403).json({ message: 'Invalid Method.' });
  }
}

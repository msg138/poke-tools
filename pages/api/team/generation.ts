import type { NextApiRequest, NextApiResponse } from 'next';
import '../../../db/Connection';
import Pokemon from '../../../db/Pokemon';
import { authenticateToken } from '../../../utility/authentication';

type Data = {
  token?: string
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!req.headers['x-auth']) {
    res.status(403).json({ message: 'Token not found in headers.' });
    return;
  }
  const token = req.headers['x-auth'] as string;
  const user = await authenticateToken(token);
  if (!user) {
    res.status(403).json({ message: 'Unable to verify' });
    return;
  }
  if (req.method === 'PUT') {
    if (!req.body.generation) {
      res.status(403).json({ message: 'Generation required.' });
      return;
    }
    const generationNumber = Number.parseInt(req.body.generation);
    if (generationNumber < 1 || generationNumber > 8) {
      res.status(403).json({ message: 'Invalid Generation.' });
    }
    user.getCurrentTeam().generation = generationNumber;
    user.save();
    res.status(200).json({ message: 'Updated generation successfully.' });
  } else {
    res.status(403).json({ message: 'Invalid method.' })
  }
}

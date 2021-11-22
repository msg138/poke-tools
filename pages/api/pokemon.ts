import type { NextApiRequest, NextApiResponse } from 'next';
import '../../db/Connection';
import Pokemon from '../../db/Pokemon';
import { removeAllKeys } from '../../utility/json';
import { authenticateToken } from '../../utility/authentication';

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
  } else {
    const userTeam = user.getCurrentTeam();
    const generation = userTeam.generation;
    const findOptions = {
      generation,
    };
    const pokemons = await Pokemon.find(findOptions, 'id name types image');
    res.status(200).json({ message: '', data: pokemons });
  }
}

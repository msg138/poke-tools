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
  if (req.method === 'POST') {
    if (!req.body.id) {
      res.status(403).json({ message: 'Pokemon Id required.' });
      return;
    }
    const id = Number.parseInt(req.body.id);
    const team = user.getCurrentTeam();
    let name = req.body.name;
    if (!name) {
      // If no name, we set it for them.
      const pokemon = await Pokemon.findOne({ id });
      if (!pokemon) {
        res.status(403).json({ message: 'Pokemon with id does not exist' });
        return;
      } else {
        name = `${pokemon.name}-${team.members.length}`;
      }
    } else if (team.members.find((member) => {
        return member.name === name;
    })) {
      // Ensure names are unique.
      res.status(403).json({ message: 'Name must be unique!' });
      return;
    }
    team.members.push({
      id,
      name,
      level: req.body.level ? Number.parseInt(req.body.level) : 1,
    });
    user.save();
    res.status(200).json({ message: 'Added pokemon successfully.' });
  } else {
    res.status(403).json({ message: 'Invalid method.' })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import '../../db/Connection';
import Pokemon from '../../db/Pokemon';
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
    return;
  }
  if (req.method === 'GET') {
    res.status(200).json({ message: '', data: {
      team: user.getCurrentTeam(),
      teams: user.teams.map(({ generation, name }) => ({ generation, name })),
    }});
  } else if (req.method === 'PUT') {
    if (!req.body.name) {
      res.status(403).json({ message: 'Team name is required.' });
      return;
    }
    const newTeam = user.teams.findIndex((t) => t.name === req.body.name);
    if (newTeam < 0) {
      res.status(403).json({ message: 'Invalid team. Does not exist.' });
      return;
    }
    user.currentTeam = newTeam;
    await user.save();
    res.status(200).json({ message: 'Current Team Changed.' });
  } else if (req.method === 'POST') {
    if (!req.body.name || !req.body.generation) {
      res.status(403).json({ message: 'Name and Generation are required.' });
      return;
    }
    const name = req.body.name;
    const generation = Number.parseInt(req.body.generation);
    user.teams.push({
      generation,
      name,
      members: [],
      settings: {},
    });
    await user.save();
    res.status(200).json({ message: 'Team created.' });
  } else if (req.method === 'DELETE') {
    if (!req.body.name) {
      res.status(403).json({ message: 'Team name is required.' });
      return;
    }
    const teamToRemove = user.teams.findIndex((t) => t.name === req.body.name);
    if (teamToRemove < 0) {
      res.status(403).json({ message: 'Invalid team. Does not exist.' });
      return;
    }
    if (user.currentTeam === teamToRemove) {
      res.status(403).json({ message: 'Cannot delete current team!' });
      return;
    }
    user.teams.splice(teamToRemove, 1);
    if (teamToRemove < user.currentTeam) {
      user.currentTeam -= 1;
    }
    await user.save();
    res.status(200).json({ message: 'Team Deleted.' });
  } else {
    res.status(403).json({ message: 'Invalid method.' });
  }
}

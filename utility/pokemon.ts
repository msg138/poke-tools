import type { TeamType }from '../db/User';

export const hasCaughtPokemon = (team: TeamType, pokemonId: number) => {
  if (team.members.find((member) => {
    return member.id === pokemonId;
  }))
    return true;
  return false;
};

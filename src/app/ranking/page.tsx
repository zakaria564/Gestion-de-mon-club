
"use client";

import { useResultsContext, Result } from "@/context/results-context";
import { useClubContext } from "@/context/club-context";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Player } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayersContext } from "@/context/players-context";
import { useOpponentsContext } from "@/context/opponents-context";
import { Badge } from "@/components/ui/badge";

interface TeamStats {
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface ScorerStat {
    rank: number;
    name: string;
    team: string;
    isClubPlayer: boolean;
    goals: number;
}

const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const matchTypes = ['Match Championnat', 'Match Coupe', 'Match Tournoi'];

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
  'hsl(var(--chart-10))',
  'hsl(var(--chart-11))',
];

// Simple hash function to get a consistent color for a team name
const getTeamColor = (teamName: string, clubName: string, colorMap: Map<string, string>): string => {
  if (teamName === clubName) {
    return 'hsl(var(--chart-2))'; // Specific green for user's club
  }
  if (teamName.toUpperCase() === 'WAC') {
    return 'hsl(0, 80%, 60%)'; // Light red for WAC
  }
  if (colorMap.has(teamName)) {
    return colorMap.get(teamName)!;
  }
  return 'hsl(var(--secondary))';
};


export default function RankingPage() {
  const resultsContext = useResultsContext();
  const clubContext = useClubContext();
  const playersContext = usePlayersContext();
  const opponentsContext = useOpponentsContext();

  if (!resultsContext || !clubContext || !playersContext || !opponentsContext) {
    throw new Error("RankingPage must be used within all required providers");
  }

  const { results, loading: resultsLoading } = resultsContext;
  const { clubInfo } = clubContext;
  const { players, loading: playersLoading } = playersContext;
  const { opponents, loading: opponentsLoading } = opponentsContext;

  const loading = resultsLoading || playersLoading || opponentsLoading;

  const [teamCategoryFilter, setTeamCategoryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState<'Masculin' | 'Féminin'>('' as 'Masculin');
  const [activeTab, setActiveTab] = useState(matchTypes[0]);

  const filteredResults = useMemo(() => {
    return results.filter(result =>
      result.teamCategory === teamCategoryFilter &&
      result.gender === genderFilter
    );
  }, [results, teamCategoryFilter, genderFilter]);

  const rankings = useMemo(() => {
    const stats: { [key: string]: TeamStats } = {};

    let resultsForRanking: Result[];

    if (activeTab === 'Match Championnat') {
      resultsForRanking = filteredResults.filter(result => result.category === activeTab);
    } else {
      resultsForRanking = filteredResults.filter(result =>
        result.category === activeTab &&
        (result.matchType === 'club-match' || !result.matchType)
      );
    }

    const initializeTeam = (teamName: string) => {
      if (!stats[teamName]) {
        stats[teamName] = {
          team: teamName,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
      }
    };

    resultsForRanking.forEach((result) => {
      const scoreParts = result.score.split('-').map(s => parseInt(s.trim()));
      if (scoreParts.length !== 2 || isNaN(scoreParts[0]) || isNaN(scoreParts[1])) {
        return;
      }

      const homeGoals = scoreParts[0];
      const awayGoals = scoreParts[1];

      let homeTeam: string, awayTeam: string;

      if (result.matchType === 'opponent-vs-opponent') {
        homeTeam = result.homeTeam!;
        awayTeam = result.awayTeam!;
      } else {
        const isHome = result.homeOrAway === 'home';
        homeTeam = isHome ? clubInfo.name : result.opponent;
        awayTeam = isHome ? result.opponent : clubInfo.name;
      }

      if (!homeTeam || !awayTeam) return;

      initializeTeam(homeTeam);
      initializeTeam(awayTeam);

      stats[homeTeam].played += 1;
      stats[awayTeam].played += 1;
      stats[homeTeam].goalsFor += homeGoals;
      stats[awayTeam].goalsFor += awayGoals;
      stats[homeTeam].goalsAgainst += awayGoals;
      stats[awayTeam].goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {
        stats[homeTeam].wins += 1;
        stats[homeTeam].points += 3;
        stats[awayTeam].losses += 1;
      } else if (awayGoals > homeGoals) {
        stats[awayTeam].wins += 1;
        stats[awayTeam].points += 3;
        stats[homeTeam].losses += 1;
      } else {
        stats[homeTeam].draws += 1;
        stats[homeTeam].points += 1;
        stats[awayTeam].draws += 1;
        stats[awayTeam].points += 1;
      }
    });

    return Object.values(stats)
      .map(team => ({
        ...team,
        goalDifference: team.goalsFor - team.goalsAgainst,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.team.localeCompare(b.team);
      });

  }, [filteredResults, clubInfo.name, activeTab]);

  const scorersRanking = useMemo(() => {
    const scorerStats: { [key: string]: { goals: number, team: string } } = {};

    filteredResults.forEach(result => {
        result.scorers?.forEach(scorer => {
            let playerName = scorer.playerName;
            let teamName = clubInfo.name; // Default to club name

            const nameRegex = /(.*) \((.*)\)/;
            const match = scorer.playerName.match(nameRegex);

            if (match) {
                playerName = match[1].trim();
                teamName = match[2].trim();
            } else {
                const isClubPlayer = players.some(p => p.name === scorer.playerName && p.teamCategory === result.teamCategory && p.gender === result.gender);
                if (!isClubPlayer && result.matchType !== 'opponent-vs-opponent') {
                    teamName = result.opponent;
                }
            }
            
            const key = `${playerName}__${teamName}`;
            if (!scorerStats[key]) {
                scorerStats[key] = { goals: 0, team: teamName };
            }
            scorerStats[key].goals += scorer.count;
        });
    });

    const sortedScorers = Object.entries(scorerStats)
        .map(([key, data]) => {
            const [name] = key.split('__');
            return { name, team: data.team, goals: data.goals };
        })
        .sort((a, b) => b.goals - a.goals);

    let rank = 1;
    return sortedScorers.map((scorer, index) => {
      if (index > 0 && scorer.goals < sortedScorers[index - 1].goals) {
        rank = index + 1;
      }
      return { ...scorer, rank };
    });
  }, [filteredResults, clubInfo.name, players]);


  const teamColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const teams = [...new Set(scorersRanking.map(s => s.team))];
    let colorIndex = 0;
    teams.forEach(team => {
      if (team !== clubInfo.name) {
        map.set(team, chartColors[colorIndex % chartColors.length]);
        colorIndex++;
      }
    });
    return map;
  }, [scorersRanking, clubInfo.name]);


  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-10 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 9 }).map((_, i) => <TableHead key={i}><Skeleton className="h-6 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart className="h-8 w-8" />
          Classement
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Select value={teamCategoryFilter} onValueChange={setTeamCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {playerCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Masculin">Masculin</SelectItem>
            <SelectItem value="Féminin">Féminin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {matchTypes.map(type => (
            <TabsTrigger key={type} value={type}>{type.replace('Match ', '')}</TabsTrigger>
          ))}
          <TabsTrigger value="scorers"><Trophy className="mr-2 h-4 w-4" />Buteurs</TabsTrigger>
        </TabsList>
        {matchTypes.map(type => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle>Classement - {type.replace('Match ', '')}</CardTitle>
                <CardDescription>
                  Classement des équipes {genderFilter === 'Féminin' ? 'féminines' : 'masculines'} pour la catégorie {teamCategoryFilter}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead className="text-center">J</TableHead>
                      <TableHead className="text-center">G</TableHead>
                      <TableHead className="text-center">N</TableHead>
                      <TableHead className="text-center">P</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">BP</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">BC</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">DB</TableHead>
                      <TableHead className="text-center">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.length > 0 ? (
                      rankings.map((stat, index) => (
                        <TableRow key={stat.team} className={stat.team === clubInfo.name ? "bg-muted" : ""}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{stat.team}</TableCell>
                          <TableCell className="text-center">{stat.played}</TableCell>
                          <TableCell className="text-center">{stat.wins}</TableCell>
                          <TableCell className="text-center">{stat.draws}</TableCell>
                          <TableCell className="text-center">{stat.losses}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell">{stat.goalsFor}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell">{stat.goalsAgainst}</TableCell>
                          <TableCell className="text-center hidden sm:table-cell">{stat.goalDifference}</TableCell>
                          <TableCell className="text-center font-bold">{stat.points}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center">
                          Aucun résultat de type "{type.replace('Match ', '')}" trouvé pour cette catégorie et ce genre.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
         <TabsContent value="scorers">
            <Card>
                <CardHeader>
                    <CardTitle>Classement des Buteurs</CardTitle>
                    <CardDescription>
                        Meilleurs buteurs pour la catégorie {teamCategoryFilter} ({genderFilter === 'Féminin' ? 'Féminin' : 'Masculin'}) toutes compétitions confondues.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Rang</TableHead>
                                <TableHead>Joueur</TableHead>
                                <TableHead>Équipe</TableHead>
                                <TableHead className="text-right">Buts</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scorersRanking.length > 0 ? (
                                scorersRanking.map((scorer, index) => (
                                    <TableRow key={`${scorer.name}-${index}`}>
                                        <TableCell className="font-medium">{scorer.rank}</TableCell>
                                        <TableCell className="font-medium">{scorer.name}</TableCell>
                                        <TableCell>
                                            <Badge 
                                              style={{ 
                                                backgroundColor: getTeamColor(scorer.team, clubInfo.name, teamColorMap), 
                                                color: 'white' 
                                              }} 
                                              className="border-transparent"
                                            >
                                                {scorer.team}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{scorer.goals}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        Aucun buteur trouvé pour cette catégorie et ce genre.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

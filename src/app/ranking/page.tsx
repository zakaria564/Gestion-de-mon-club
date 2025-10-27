
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
import { BarChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const playerCategories: Player['category'][] = ['Sénior', 'U23', 'U19', 'U18', 'U17', 'U16', 'U15', 'U13', 'U11', 'U9', 'U7'];
const matchTypes = ['Match Championnat', 'Match Coupe', 'Match Tournoi'];

export default function RankingPage() {
  const resultsContext = useResultsContext();
  const clubContext = useClubContext();

  if (!resultsContext || !clubContext) {
    throw new Error("RankingPage must be used within ResultsProvider and ClubProvider");
  }

  const { results, loading } = resultsContext;
  const { clubInfo } = clubContext;
  const [teamCategoryFilter, setTeamCategoryFilter] = useState('Sénior');
  const [activeTab, setActiveTab] = useState(matchTypes[0]);
  
  const rankings = useMemo(() => {
    const stats: { [key: string]: TeamStats } = {};

    let filteredResults: Result[];

    if (activeTab === 'Match Championnat') {
      filteredResults = results.filter(result => result.teamCategory === teamCategoryFilter && result.category === activeTab);
    } else {
      // For Cup and Tournament, only include matches involving our club
      filteredResults = results.filter(result => 
        result.teamCategory === teamCategoryFilter && 
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

    filteredResults.forEach((result) => {
      const scoreParts = result.score.split('-').map(s => parseInt(s.trim()));
      if (scoreParts.length !== 2 || isNaN(scoreParts[0]) || isNaN(scoreParts[1])) {
        return; // Skip invalid scores
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
            return b.goalsFor - a.goalsFor;
        });

  }, [results, clubInfo.name, teamCategoryFilter, activeTab]);

  if (loading) {
     return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-10 w-48" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2"/>
                    <Skeleton className="h-6 w-1/4"/>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {Array.from({ length: 9 }).map((_, i) => <TableHead key={i}><Skeleton className="h-6 w-full"/></TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                     {Array.from({ length: 9 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full"/></TableCell>)}
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
          <BarChart className="h-8 w-8"/>
          Classement
        </h2>
      </div>

       <div className="flex items-center gap-4">
            <Select value={teamCategoryFilter} onValueChange={setTeamCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                    {playerCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            {matchTypes.map(type => (
              <TabsTrigger key={type} value={type}>{type.replace('Match ', '')}</TabsTrigger>
            ))}
          </TabsList>
          {matchTypes.map(type => (
             <TabsContent key={type} value={type}>
                <Card>
                  <CardHeader>
                    <CardTitle>Classement - {type.replace('Match ', '')}</CardTitle>
                    <CardDescription>
                      Classement des équipes pour la catégorie {teamCategoryFilter}.
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
                              <TableRow key={stat.team} className={stat.team === clubInfo.name ? "bg-accent/50" : ""}>
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
                              Aucun résultat de type "{type.replace('Match ', '')}" trouvé pour cette catégorie.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
             </TabsContent>
          ))}
       </Tabs>
    </div>
  );
}

import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { Competition } from "../../../types/database.types";
import { getCompetitionById } from "../../../services/competitionService";

export default function CompetitionDetails() {
  const { id } = useLocalSearchParams();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const data = await getCompetitionById(id as string);
        setCompetition(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load competition');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetition();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!competition) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Competition not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">{competition.name}</Text>
      <Text className="mb-2">Description: {competition.description || 'No description available'}</Text>
      <Text>Start Date: {new Date(competition.start_date).toLocaleDateString()}</Text>
      <Text>End Date: {new Date(competition.end_date).toLocaleDateString()}</Text>
    </View>
  );
}
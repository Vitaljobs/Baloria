interface TrendingScore {
    questionId: string;
    score: number;
}

export const calculateTrendingScore = (
    heartsCount: number,
    answersCount: number,
    createdAt: string
): number => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursSincePosted = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    // Prevent division by zero
    if (hoursSincePosted < 0.1) return 0;

    // Trending formula: (hearts * 2 + answers) / hours_since_posted
    // Hearts are weighted more than answers
    const engagementScore = (heartsCount * 2) + answersCount;
    const trendingScore = engagementScore / Math.pow(hoursSincePosted + 2, 1.5);

    return trendingScore;
};

export const getTrendingQuestions = (
    questions: Array<{
        id: string;
        hearts_count: number;
        answers_count: number;
        created_at: string;
    }>,
    limit: number = 5
): string[] => {
    const scores: TrendingScore[] = questions.map((q) => ({
        questionId: q.id,
        score: calculateTrendingScore(q.hearts_count, q.answers_count, q.created_at),
    }));

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Return top N question IDs
    return scores.slice(0, limit).map((s) => s.questionId);
};

export const isTrending = (
    heartsCount: number,
    answersCount: number,
    createdAt: string,
    threshold: number = 1.0
): boolean => {
    const score = calculateTrendingScore(heartsCount, answersCount, createdAt);
    return score >= threshold;
};

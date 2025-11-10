import apiRequest from '@/lib/api';

export interface SearchSuggestionsResponse {
  courses: Array<{ id: string; title: string; imageUrl?: string }>;
  instructors: Array<{ id: number; name: string; avatar?: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
}

const searchService = {
  async getSuggestions(q: string): Promise<SearchSuggestionsResponse> {
    if (!q || !q.trim()) {
      return { courses: [], instructors: [], tags: [] };
    }
    return apiRequest<SearchSuggestionsResponse>(`/api/search/suggestions?q=${encodeURIComponent(q.trim())}`, {
      method: 'GET',
    });
  },
};

export default searchService;

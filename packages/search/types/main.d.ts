import { SearchResult } from 'minisearch';

export interface RocketSearchResult extends SearchResult {
  section: string;
  title: string;
  headline: string;
  body: string;
}

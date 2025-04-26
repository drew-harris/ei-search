export interface AlgoliaMoment {
  objectID?: string;
  thumbnail: string | null;
  episodeTitle: string;
  episodeId: string;
  content: string;
  timestamp: number;
  position?: number;
  aid?: string;
}

export type TypesenseMoment = {
  id: string;
  content: string;
  start: number;
  videoId: string;
  youtubeVideoId: string;
  videoTitle: string;
  thumbnailUrl: string;
};

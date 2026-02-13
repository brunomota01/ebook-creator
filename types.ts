
export interface Source {
  uri: string;
  title: string;
}

export interface Ebook {
  title: string;
  content: string;
  sources: Source[];
  coverImageUrl: string;
  backCoverImageUrl: string;
}

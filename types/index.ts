export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  read: boolean;
  comment: string;
  dateAdded: string;
}

export type NewBook = Omit<Book, 'id'>;

export type SortOption =
  | 'dateAdded'
  | 'title'
  | 'titleDesc'
  | 'author'
  | 'rating'
  | 'ratingAsc';

export interface GoogleBookItem {
  volumeInfo: {
    title?: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

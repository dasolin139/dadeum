export interface ShowcaseExample {
  genre_id: string;
  genre_label: string;
  before: string;
  after: string;
  note: string;
}

export interface ShowcaseData {
  examples: ShowcaseExample[];
}

export interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  wishlist: string[];
}

export interface DBParticipant {
  id: number;
  first_name: string;
  last_name: string;
  wishlist: string;
}

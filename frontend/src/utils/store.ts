import { create } from "zustand";

interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  artistId: string;
  predictedCost?: number;
}

interface UserState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  favoriteArtists: Artist[];
  predictedEvents: Event[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: UserState["user"]) => void;
  setFavoriteArtists: (artists: Artist[]) => void;
  addFavoriteArtist: (artist: Artist) => void;
  removeFavoriteArtist: (artistId: string) => void;
  setPredictedEvents: (events: Event[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

const useStore = create<UserState>((set) => ({
  isAuthenticated: false,
  user: null,
  favoriteArtists: [],
  predictedEvents: [],
  isLoading: false,
  error: null,

  // Actions
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setUser: (user) => set({ user }),
  setFavoriteArtists: (artists) => set({ favoriteArtists: artists }),
  addFavoriteArtist: (artist) =>
    set((state) => ({
      favoriteArtists: [...state.favoriteArtists, artist],
    })),
  removeFavoriteArtist: (artistId) =>
    set((state) => ({
      favoriteArtists: state.favoriteArtists.filter(
        (artist) => artist.id !== artistId
      ),
    })),
  setPredictedEvents: (events) => set({ predictedEvents: events }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      favoriteArtists: [],
      predictedEvents: [],
    }),
}));

export default useStore;

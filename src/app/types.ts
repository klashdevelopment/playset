export type ArtistData = {
    mbid: string;
    tmid?: number;
    name: string;
    sortName: string;
    disambiguation: string;
    url: string;
}
export type CityData = {
    id: string;
    name: string;
    stateCode: string;
    state: string;
    coords: any;
    country: any;
}
export type VenueData = {
    city: CityData;
    url: string;
    id: string;
    name: string;
}
export type TourData = {
    name: string;
}
export type SongData = {
    name: string;
    with: WithData;
    cover: CoverData;
    info: string;
    tape: boolean;
}
export type SetData = {
    name: string;
    encore: number;
    song: SongData[];
}
export type WithData = {
    mbid: string;
    name: string;
    sortName: string;
    disambiguation: string;
    url: string;
}
export type CoverData = {
    mbid: string;
    name: string;
    sortName: string;
    disambiguation: string;
    url: string;
}
export type SetlistData = {
    artist: ArtistData;
    venue: VenueData;
    tour: TourData;
    sets: {set: SetData[]};
    info: string;
    url: string;
    id: string;
    versionId: string;
    eventDate: string;
    lastUpdated: string;
}
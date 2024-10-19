"use client";
import { Accordion, AccordionDetails, accordionDetailsClasses, AccordionGroup, AccordionSummary, accordionSummaryClasses, Autocomplete, Button, CssVarsProvider, Input, Modal, ModalClose, Sheet, Typography } from "@mui/joy";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArtistData, CityData, SetData, SetlistData, SongData, TourData, VenueData } from "../types";
import axios from 'axios';
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import SongDisplay, { SetDisplay } from "../songDisplay";
import ToggleAuthButton from "../toggleAuthButton";
import Link from "next/link";
import PModal from "../modals";
import Section, { Check } from "../spot";
import Head from "next/head";

declare const window: any;

export default function Home() {
    const session = useSession();

    function getAccessToken() {
        return (session.data as any).accessToken?.accessToken;
    }

    async function fetchSpotifyApi(endpoint: string, method: string, body: any) {
        let options: any = {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
            },
            method
        };
        if (body) {
            options['body'] = JSON.stringify(body);
        }
        const res = await fetch(`https://api.spotify.com/${endpoint}`, options);
        const output = await res.json();
        if (output.error && output.error.message == "The access token expired") {
            signOut();
        }
        return output;
    }
    const track = {
        name: "",
        album: {
            images: [
                { url: "" }
            ]
        },
        artists: [
            { name: "" }
        ]
    }

    const [player, setPlayer] = useState<any>(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);

    function loadPlayer() {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: (cb: any) => { cb(getAccessToken()); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }: { device_id: any }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }: { device_id: any }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', ((state: any) => {

                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                console.log(state);

                player.getCurrentState().then((state: any) => {
                    (!state) ? setActive(false) : setActive(true)
                });

            }));

            player.connect();
        };
    }
    return (
        <main>
            <Head>
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7614959482950422"
                    crossOrigin="anonymous"></script>
            </Head>
            <CssVarsProvider defaultMode="dark">
                <Sheet variant="plain" sx={{ width: '100vw', height: '100vh', background: '#24242C', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <img src="/playset_logo.png" style={{ height: '270px' }} alt="" />
                    <h1>Convert setlists to playlists with ease.</h1> <ToggleAuthButton />
                    <Sheet variant="outlined" sx={{ borderColor: '#404144', borderWidth: '3px', background: '#1F1E25', display: 'flex', alignItems: 'center', flexDirection: 'column', padding: '3rem 1rem', gap: '1rem', borderRadius: '10px' }} className="computer-30p">
                        <Section title="Share It" number="1" smalltext="Paste a spotify song url here!">
                            <Input placeholder="https://open.spotify.com/track/5JqZ3oqF00jkT81fo2Kw7v" />
                        </Section>
                        <Section title="Stream It" number="2" smalltext="Stream your favorite music at ease.">
                            <Button onClick={loadPlayer} color="success" disabled={player != undefined && (session.data as any).accessToken} startDecorator={<Check style={{ fill: 'white', width: '16px' }} />}>Load Player</Button>
                            {(player && (session.data as any).accessToken) && <>
                                <img src={current_track.album.images[0].url}
                                    className="now-playing__cover" alt="" />

                                <div className="now-playing__side">
                                    <div className="now-playing__name">{current_track.name}
                                    </div>

                                    <div className="now-playing__artist">{current_track.artists[0].name}</div>
                                </div>
                                <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                    &lt;&lt;
                                </button>

                                <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                    {is_paused ? "PLAY" : "PAUSE"}
                                </button>

                                <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                    &gt;&gt;
                                </button>
                            </>}
                        </Section>
                    </Sheet>
                </Sheet>
                <div style={{ height: '200px' }} /> {/* gap */}
                <div style={{ width: '100%', padding: '10px', textAlign: 'center' }}>created by klash.dev, open sourced on github</div>
            </CssVarsProvider>
        </main>
    );
}

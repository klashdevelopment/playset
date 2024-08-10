"use client";
import { Accordion, AccordionDetails, accordionDetailsClasses, AccordionGroup, AccordionSummary, accordionSummaryClasses, Autocomplete, Button, CssVarsProvider, Input, Modal, ModalClose, Sheet, Typography } from "@mui/joy";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArtistData, CityData, SetData, SetlistData, SongData, TourData, VenueData } from "./types";
import axios from 'axios';
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import SongDisplay, { SetDisplay } from "./songDisplay";
import ToggleAuthButton from "./toggleAuthButton";
import Link from "next/link";
import PModal from "./modals";
import Section, { Check } from "./spot";
import Head from "next/head";

const examples = [
  "https://www.setlist.fm/setlist/boywithuke/2023/the-fonda-theatre-los-angeles-ca-3ba3388c.html",
  "https://www.setlist.fm/setlist/king-gizzard-and-the-lizard-wizard/2022/red-rocks-amphitheatre-morrison-co-6bbe3ef6.html",
  "https://www.setlist.fm/setlist/u2/1992/nassau-veterans-memorial-coliseum-uniondale-ny-2bd6f836.html",
  "https://www.setlist.fm/setlist/portugal-the-man/2023/hollywood-bowl-los-angeles-ca-3ba47020.html",
  "https://www.setlist.fm/setlist/dan-deacon/2023/the-rebel-lounge-phoenix-az-5ba17ff0.html",
  "https://www.setlist.fm/setlist/wings-of-desire/2024/afas-live-amsterdam-netherlands-53ad433d.html"
];

export default function Home() {
  const session = useSession();
  const [setlistId, setSetlistId] = useState("");
  const [setlistUrl, setSetlistUrl] = useState("");
  const [setlistData, setSetlistData] = useState<SetlistData>({} as SetlistData);

  const [dataLoading, setDataLoading] = useState(false);

  const [showArtistImage, setShowArtistImage] = useState("");

  const [showPlaySongModal, setShowPlaySongModal] = useState(false);
  const [playSong, setPlaySong] = useState<SongData>({} as SongData);

  const [playSongPreviewLink, setPlaySongPreviewLink] = useState("");

  // const [couldntFindSongModal, setCouldntFindSongModal] = useState(false);
  // const [couldntFindSong, setCouldntFindSong] = useState("");

  const [songsBad, setSongsBad] = useState<string[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);

  const [plTitle, setPlTitle] = useState("");
  const [plDesc, setPlDesc] = useState("");
  const [plID, setPlID] = useState("");

  function fillTitleAndDescription() {
    if (!setlistData.artist) return;
    setPlTitle(setlistData.artist.name + " - " + (setlistData.tour?.name || setlistData.venue?.name || "Setlist") + " " + setlistData.eventDate);
    setPlDesc("A playlist of " + setlistData.artist.name + "'s " + (setlistData.tour?.name || setlistData.venue?.name || "setlist") + " created using Playset.");
  }

  useEffect(() => {
    if (!setlistData.artist) return;
    getSongUri(playSong.name, setlistData.artist.name).then(preview => {
      if (preview == null && playSong.cover) {
        getSongUri(playSong.name, playSong.cover.name).then(preview => {
          setPlaySongPreviewLink(preview);
        });
        return;
      }
      setPlaySongPreviewLink(preview);
    })
  }, [playSong]);

  function openAndPlay(song: SongData) {
    setPlaySong(song);
    setShowPlaySongModal(true);
  }

  async function refreshSetlistData(newID: string, callback: () => void) {
    fetch('/api/setlist?id=' + newID)
      .then(response => response.json())
      .then(data => {
        setSetlistData(data)
        artistSearch(data.artist.name)
          .then((searchdata) => {
            setShowArtistImage(searchdata.images[0].url);
          });
        callback();
        setDataLoading(false);
      })
      .catch(error => {
        console.log(error);
        setDataLoading(false);
      });
  }

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

  async function artistSearch(artist: string) {
    const output = await fetchSpotifyApi(`v1/search?q=${artist}&type=artist&limit=1`, 'GET', null);
    return output.artists.items[0];
  }

  async function getSongUri(song: string, artist: string) {
    const output = await fetchSpotifyApi(`v1/search?q=${song}+artist%3A\"${artist}\"&type=track&limit=1`, 'GET', null);
    console.log(output);
    if (output.tracks.items.length == 0) return "";
    return output.tracks.items[0].uri;
  }

  async function getAllSongURIs() {
    let uris = [];
    let waitingFor = 0;
    for (let set of setlistData.sets.set) {
      for (let song of set.song) {
        let uri = await getSongUri(song.name, setlistData.artist.name);
        if ((uri == null || uri.trim() == "") && song.cover) {
          uri = await getSongUri(song.name, song.cover.name);
        }
        if (uri == null || uri.trim() == "") {
          // setCouldntFindSong(song.name);
          // setCouldntFindSongModal(true);
          // waitingFor++;
          // await new Promise((resolve: any) => {
          //   const interval = setInterval(() => {
          //     if (couldntFindSong.startsWith("spotify:")) {
          //       clearInterval(interval);
          //       if(!couldntFindSong.startsWith("spotify:none")) {
          //         uris.push(couldntFindSong);
          //       }
          //       waitingFor--;
          //       resolve();
          //     }
          //   }, 100);
          // });
          setSongsBad([...songsBad, song.name]);
        } else {
          uris.push(uri);
        }
      }
    }
    // while (waitingFor > 0) {
    //   await new Promise(resolve => setTimeout(resolve, 100));
    // }
    return uris;
  }

  async function makePlaylist() {
    if (!setlistData.artist) return;
    setDataLoading(true);
    setSongsBad([]);
    let finalTitle = plTitle;
    let finalDesc = plDesc;
    if (!finalTitle && !finalDesc) {
      finalTitle = (setlistData.artist.name + " - " + (setlistData.tour?.name || setlistData.venue?.name || "Setlist") + " " + setlistData.eventDate);
      finalDesc = ("A playlist of " + setlistData.artist.name + "'s " + (setlistData.tour?.name || setlistData.venue?.name || "setlist") + " created using Playset.");
    }
    if (!finalTitle && finalDesc) finalTitle = ("Playset Playlist");
    const uris = await getAllSongURIs();
    if (uris.length == 0) {
      console.log("No songs found");
      return;
    }
    const output = await fetchSpotifyApi(`v1/users/${(session.data as any).accessToken.id}/playlists`, 'POST', {
      "name": finalTitle,
      "description": finalDesc,
      "public": false
    });
    const playlistId = output.id;
    const result = await fetchSpotifyApi(`v1/playlists/${playlistId}/tracks`, 'POST', { uris });
    console.log(result);
    console.log(output);
    setDataLoading(false);
    setShowResultModal(true);
    setPlID(playlistId);
  }

  useEffect(() => {
    try {
      const fileName = setlistUrl.split('/')[6];
      const ids = fileName.split('-');
      const idName = ids[ids.length - 1];
      setSetlistId(idName.replace(".html", ""));
      refreshSetlistData(idName.replace(".html", ""), () => {
      });
    } catch (x) {
      setSetlistId("");
    }
  }, [setlistUrl]);
  return (
    <main>
      <Head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7614959482950422"
          crossOrigin="anonymous"></script>
      </Head>
      <CssVarsProvider defaultMode="dark">
        <PModal onClose={() => { setShowResultModal(false); }} open={showResultModal}>
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor={`${plID ? 'success' : 'danger'}`}
            fontWeight="lg"
            mb={1}
          >
            {plID ? "Success!" : "Error"}
          </Typography>
          {(songsBad.length > 0) && (
            <>
              We had to skip these songs:
              <ul>
                {songsBad.map((song, i) => (
                  <li style={{ color: 'red' }} key={i}>{song}</li>
                ))}
              </ul>
            </>
          )}
          {plID ? (
            <>
              <p>Playlist created successfully!</p>
              <iframe src={`https://open.spotify.com/embed/playlist/${plID}`} width="300" height="380" style={{ background: '#222' }} frameBorder="0" allow="encrypted-media"></iframe>
            </>
          ) : (
            <p>There was an error creating the playlist. Please try again later.</p>
          )}
        </PModal>
        <PModal onClose={() => { setShowPlaySongModal(false); setPlaySongPreviewLink(""); }} open={showPlaySongModal}>
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            fontWeight="lg"
            mb={1}
          >
            {playSong.name}
            {playSong.tape && <span style={{ color: 'red' }}> (tape)</span>}
            {playSong.cover && <span style={{ color: 'green' }}> (cover of {playSong.cover.name})</span>}
          </Typography>
          {playSong.info && <><p>Info: ${playSong.info}</p><br /></>}
          {(!playSongPreviewLink && playSong && setlistData.artist) &&
            <>
              <p>We can't find this song on spotify.</p>
              <p>Would you like to <Link target="_blank" href={`https://google.com/search?q=${playSong.name} by ${setlistData.artist.name}`} style={{ color: 'blueviolet' }}>google it</Link>?</p>
            </>
          }
          {(playSongPreviewLink && !playSongPreviewLink.startsWith("spotify:track:")) && <audio controls>
            <source src={playSongPreviewLink} type="audio/mpeg" />
          </audio>}
          {playSongPreviewLink.startsWith("spotify:track:") && <iframe src={`https://open.spotify.com/embed/track/${playSongPreviewLink.split(":")[2]}`} width="300" height="80" style={{ background: '#222' }} frameBorder="0" allow="encrypted-media"></iframe>}
        </PModal>
        <Sheet variant="plain" sx={{ width: '100vw', height: '100vh', background: '#24242C', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          {/*<h1>Playset</h1> <h3>convert setlists to playlists</h3>*/}
          <img src="/playset_logo.png" style={{ height: '270px' }} alt="" />
          <h1>Convert setlists to playlists with ease.</h1> <ToggleAuthButton />
          <Sheet variant="outlined" sx={{ borderColor: '#404144', borderWidth: '3px', background: '#1F1E25', display: 'flex', alignItems: 'center', flexDirection: 'column', padding: '3rem 1rem', gap: '1rem', borderRadius: '10px', pointerEvents: `${dataLoading ? 'none' : 'auto'}` }} className="computer-30p">

            <Section title="Convert It" number="1" smalltext="Paste a setlist.fm url here!">
              <div style={{ display: 'flex', gap: '10px' }} className="mobile-column">
                <Input color={`${setlistId ? 'neutral' : 'danger'}`} sx={{ width: '300px' }} placeholder="https://setlist.fm/setlist/..." value={setlistUrl} onChange={(e) => {
                  setSetlistUrl(e.target.value);
                }} />
                <Button className="override-bg1" onClick={() => {
                  setSetlistUrl(examples[Math.floor(Math.random() * examples.length)]);
                }}>Try an Example</Button>
              </div>
            </Section>
            <Section title="Customize It" number="2" smalltext="(optional)" bordered={true}>
              <p>{setlistData.tour ? setlistData.artist.name + "'s " + setlistData.tour.name : (
                setlistData.venue ? setlistData.artist.name + " - " + setlistData.venue.name : "No setlist selected"
              )}</p>
              <div style={{ display: 'flex', gap: '5px' }} className="mobile-column">
                {setlistData.sets && (<>
                  <SetDisplay sets={setlistData.sets.set} image={showArtistImage} openAndPlay={openAndPlay} />
                  <AccordionGroup
                    variant="outlined"
                    transition="0.2s"
                    sx={{
                      maxWidth: 400,
                      borderRadius: 'lg',
                      [`& .${accordionSummaryClasses.button}:hover`]: {
                        bgcolor: 'transparent',
                      },
                      [`& .${accordionDetailsClasses.content}`]: {
                        boxShadow: (theme) => `inset 0 1px ${theme.vars.palette.divider}`,
                        [`&.${accordionDetailsClasses.expanded}`]: {
                          paddingBlock: '0.75rem',
                        },
                      },
                    }}
                  >
                    <Accordion defaultExpanded={true}>
                      <AccordionSummary>Playlist</AccordionSummary>
                      <AccordionDetails>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <Input placeholder={"Title"} value={plTitle} onChange={(e) => { setPlTitle(e.target.value) }} />
                          <Input placeholder={"Description"} value={plDesc} onChange={(e) => { setPlDesc(e.target.value) }} />
                          <Button color="neutral" onClick={fillTitleAndDescription}>Auto Generate</Button>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </AccordionGroup>
                </>)}
              </div>
            </Section>
            <Section title="Stream It" number="3" smalltext="Create and save the playlist to your Spotify account.">
              <Button onClick={makePlaylist} color="success" startDecorator={<Check style={{ fill: 'white', width: '16px' }} />}>Make it a Playlist</Button>
            </Section>
            {dataLoading && <div style={{ height: '100%', width: '100%', position: 'absolute', borderRadius:'10px', background: "rgba(0,0,0,0.2)", backdropFilter: 'blur(10px)', top: '0px', left: '0px', display: `${dataLoading ? 'flex' : 'none'}`, justifyContent: 'center', alignItems: 'center' }}>
              <img src="/dualringsvg.svg" />
            </div>}
          </Sheet>

          {/* <Sheet variant="outlined" sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', padding: '5px', margin: '7px 0px', borderRight: 'none', borderLeft: 'none' }} className="computer-100p">
            <h4 style={{ display: 'flex', alignItems: 'center' }}><CircleText text={"?"} /> Stats for Nerds</h4>
            <b>data loading: {dataLoading}</b>
            <b>session data: <button onClick={() => { console.log(session) }}>print it</button></b>
            <Accordion><AccordionSummary>code</AccordionSummary><AccordionDetails>{JSON.stringify(setlistData)}</AccordionDetails></Accordion>
          </Sheet> */}
        </Sheet>
        <div style={{ height: '200px' }} /> {/* gap */}
        <div style={{ width: '100%', padding: '10px', textAlign: 'center' }}>created by klash.dev, open sourced on github</div>
      </CssVarsProvider>
    </main>
  );
}

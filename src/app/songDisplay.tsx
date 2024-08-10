import { Accordion, AccordionDetails, accordionDetailsClasses, AccordionGroup, AccordionSummary, accordionSummaryClasses } from "@mui/joy"
import { ArtistData, SetData, SongData } from "./types"

function Song({ song, image, openAndPlay }: { song: SongData, image: string, openAndPlay: (song: SongData) => void  }) {
    return (
        <div style={{ borderTop: '1px solid #32383E', borderBottom: '1px solid #32383E', display: 'flex', alignItems: 'center', padding: '10px' }}>
            <div onClick={()=>{openAndPlay(song)}} style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundImage: `url(${image})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain', backgroundPosition: '50%', display: 'flex', alignItems:'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg style={{filter:'invert(1)', opacity:'0.6', width:'20px', height:'20px'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
            </div>
            <div style={{ marginLeft: '10px' }}>
                <b>{song.name}</b>
                <p>{song.cover && <span style={{color:'green'}}>(Cover)</span>} {song.tape && <span style={{color:'red'}}> (Tape)</span>}</p>
            </div>
        </div>
    )
}
export default function SongDisplay({ songs, setName, image, index, openAndPlay }: { songs: SongData[], setName: string, image: string, index: number, openAndPlay: (song: SongData) => void  }) {
    return (
        <div style={{ border: '1px solid #32383E', borderRadius: '10px' }}>
            {songs.map((song, i) => (
                <Song openAndPlay={openAndPlay} key={i} song={song} image={image} />
            ))}
        </div>
    )
}

export function SetDisplay({ sets, image, openAndPlay }: { sets: SetData[], image: string, openAndPlay: (song: SongData) => void }) {
    return (
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
                <AccordionSummary>Set List</AccordionSummary>
                <AccordionDetails>
                    {sets.map((set, i) => (
                        <Accordion>
                            <AccordionSummary>{`#${i+1} - ${set.name || "Unnamed Set"}`}</AccordionSummary>
                            <AccordionDetails>
                                <SongDisplay openAndPlay={openAndPlay} setName={set.name} key={i} songs={set.song} image={image} index={i + 1} />
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </AccordionDetails>
            </Accordion>
        </AccordionGroup>
    )
}
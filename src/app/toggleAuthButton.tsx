import { Button } from "@mui/joy";
import { signIn, signOut, useSession } from "next-auth/react";

export default function ToggleAuthButton() {
    const session = useSession();
    return (
        <>
        {session.status === 'authenticated' ? (
            <>
            <Button
              type="button"
              onClick={() => signOut({callbackUrl:"https://vigilant-umbrella-4vvg7r6q9wph79gw-3000.app.github.dev/"})}
              color="danger"
              startDecorator={<img src={`${session.data.user?.image}`} style={{width:'20px',height:'20px',borderRadius:'50%'}}/>}
            >
              Sign out from Spotify
            </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => signIn('spotify', {callbackUrl:"https://vigilant-umbrella-4vvg7r6q9wph79gw-3000.app.github.dev/"})}
              disabled={session.status === 'loading'}
              color="success"
              startDecorator={<img src={`https://open.spotify.com/favicon.ico`} style={{width:'20px',height:'20px',borderRadius:'50%'}}/>}
            >
              Sign in with Spotify
            </Button>
          )}
        </>
    );
}
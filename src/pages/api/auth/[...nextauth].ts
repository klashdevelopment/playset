import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_ID!,
      clientSecret: process.env.SPOTIFY_SECRET!,
      authorization: "https://accounts.spotify.com/authorize?scope=user-read-email,playlist-modify-private,playlist-modify-public,streaming",
    }),
  ],
  secret: process.env.SECRET,
  session: {
    strategy: `jwt`,
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = (profile as any).id
      }
      return token
    },
    async session({ session, token, user }: {session: any, token: any, user: any}) {  
      session['accessToken'] = token;
      // console.log("IM SENDING A SESSION" + JSON.stringify(session));
      return session
    }
  },
})
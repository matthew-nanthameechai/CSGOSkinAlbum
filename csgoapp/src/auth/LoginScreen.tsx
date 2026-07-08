import { GoogleLogin } from '@react-oauth/google';

export function LoginScreen({ onSuccess }: { onSuccess: (credential: string) => void }) {
  return (
    <div className="login-screen">
      <h2>Sign in to CS:GO Skin Album</h2>
      <GoogleLogin
        onSuccess={(res) => {
          if (res.credential) onSuccess(res.credential);
        }}
        onError={() => console.error('Google login failed')}
      />
    </div>
  );
}
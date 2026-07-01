'use client'

import { GoogleLogin } from '@react-oauth/google'

interface Props {
  onSuccess: (credential: string) => void
  onError: (message: string) => void
}

export function GoogleSignInButton({ onSuccess, onError }: Props) {
  return (
    <div className="flex justify-center [&>div]:w-full">
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) onSuccess(response.credential)
          else onError('Google did not return a credential')
        }}
        onError={() => onError('Google Sign-In failed')}
        theme="filled_black"
        size="large"
        width="320"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  )
}

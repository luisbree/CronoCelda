'use client';

import * as React from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogIn, LogOut, User as UserIcon, UserPlus } from 'lucide-react';

export function AuthButton({ onRegisterClick }: { onRegisterClick: () => void }) {
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    if (!auth) {
        console.error("Auth is not initialized, cannot sign in. Please check your Firebase credentials in the .env file.");
        return;
    };
    
    console.log('--- Firebase Auth Debug ---');
    console.log('Current Hostname:', window.location.hostname);
    console.log('Firebase Auth Domain:', auth.config.authDomain);
    console.log('Por favor, asegúrate que el "Current Hostname" está en la lista de "Dominios autorizados" de tu proyecto de Firebase.');
    console.log('---------------------------');

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (loading) {
    return <Skeleton className="h-10 w-24 rounded-md" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button onClick={onRegisterClick} variant="secondary" disabled={!auth}>
          <UserPlus className="mr-2 h-4 w-4" />
          Registrarse
        </Button>
        <Button onClick={handleSignIn} variant="outline" disabled={!auth}>
          <LogIn className="mr-2 h-4 w-4" />
          Acceder (Google)
        </Button>
      </div>
    );
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-10 w-10">
          <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'Usuario'} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium truncate">{user.displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

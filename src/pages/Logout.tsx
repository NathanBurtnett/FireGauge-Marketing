import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/providers/AuthProvider'; // Adjusted path
import { Loader2 } from 'lucide-react';

const Logout: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      if (user) { // Only attempt signout if user is currently logged in
        try {
          await signOut();
          // signOut internally handles session/user state update.
          // AuthProvider will pick up this change.
        } catch (error) {
          console.error("Error during sign out:", error);
          // Optionally, show an error message to the user
        }
      }
      // Always navigate to auth page after attempting logout or if no user was present
      navigate('/auth'); 
    };

    performLogout();
  }, [signOut, navigate, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Loader2 className="h-12 w-12 animate-spin text-firegauge-red mb-4" />
      <p className="text-xl text-gray-700">Logging you out...</p>
    </div>
  );
};

export default Logout; 
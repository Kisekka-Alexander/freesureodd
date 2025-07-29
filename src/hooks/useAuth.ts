import { useSession, signIn, signOut } from "next-auth/react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "@/store/slices/authSlice";
import { User } from "@/types";

export function useAuth() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        dispatch(loginFailure(result.error));
        return { success: false, error: result.error };
      }

      // If using session, update Redux state
      if (session?.user) {
        dispatch(loginSuccess(session.user as User));
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      dispatch(loginFailure(message));
      return { success: false, error: message };
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    dispatch(logout());
  };

  return {
    user: session?.user || user,
    isAuthenticated: !!session || isAuthenticated,
    loading: status === "loading" || loading,
    error,
    login,
    logout: handleLogout,
    session,
  };
}

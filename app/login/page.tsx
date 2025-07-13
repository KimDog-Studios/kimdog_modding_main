"use client";

import { useEffect, useState } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import NavBar from "@/app/components/NavBar/NavBar";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";

const googleProvider = new GoogleAuthProvider();

const DEFAULT_AVATAR =
  "https://imgs.search.brave.com/s1r_AIpKoIQseoloieS7vKc-r-07N6AePKl6M9ndZR0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRpYS5pc3RvY2twaG90by5jb20vaWQvODU1OTcwNDgyL3Bob3RvL2dvYXQuanBnP3M9NjEyeDYxMiZ3PTAmaz0yMCZjPTJqM200TjRnOUFRVW9qaEMtQzJ1TVNKNmYyUnJtSEhqXzBRVWZDYzAtdlk9";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !pendingUser) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router, pendingUser]);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);

      if (mode === "signup" && password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "70vh",
        overflow: "hidden",
        bgcolor: "#171717",
        color: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: "inherit",
      }}
    >
      <NavBar user={null} onLogout={() => {}} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              backgroundColor: "#262626",
              borderRadius: 4,
              padding: 4,
              boxShadow: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 900, mb: 3 }}
              className="font-black"
            >
              {mode === "login" ? "Sign In" : "Sign Up"}
            </Typography>

            <Box component="form" onSubmit={handleEmailSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  variant="filled"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "white" } }}
                  sx={{ bgcolor: "#333", borderRadius: 1 }}
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  variant="filled"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{ style: { color: "white" } }}
                  InputLabelProps={{ style: { color: "white" } }}
                  sx={{ bgcolor: "#333", borderRadius: 1 }}
                />
                {mode === "signup" && (
                  <TextField
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    required
                    variant="filled"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    InputProps={{ style: { color: "white" } }}
                    InputLabelProps={{ style: { color: "white" } }}
                    sx={{ bgcolor: "#333", borderRadius: 1 }}
                  />
                )}
                {error && (
                  <Typography color="error" fontWeight={600}>
                    {error}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  sx={{
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                  disabled={loading}
                >
                  {loading
                    ? mode === "login"
                      ? "Signing In..."
                      : "Signing Up..."
                    : mode === "login"
                    ? "Sign In"
                    : "Sign Up"}
                </Button>
              </Stack>
            </Box>

            <Divider
              sx={{
                my: 4,
                borderColor: "#444",
                position: "relative",
              }}
            >
              <Typography
                sx={{
                  backgroundColor: "#262626",
                  px: 1,
                  fontWeight: 600,
                  color: "#ccc",
                }}
              >
                OR {mode === "login" ? "Sign In" : "Sign Up"} with
              </Typography>
            </Divider>

            <Button
              onClick={handleGoogleSignIn}
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#db4437",
                ":hover": { backgroundColor: "#c23321" },
                color: "white",
                py: 1.2,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
              }}
              disabled={loading}
              startIcon={
                <Avatar
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png"
                  sx={{ width: 24, height: 24 }}
                />
              }
            >
              Sign in with Google
            </Button>

            <Typography mt={4} fontWeight={600} color="#aaa">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Button
                onClick={() =>
                  setMode((prev) => (prev === "login" ? "signup" : "login"))
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "#0ea5e9",
                  ml: 1,
                }}
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </Button>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

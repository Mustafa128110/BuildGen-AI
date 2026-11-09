"use client";

import Link from "next/link";
import { useEffect,useRef } from "react";
import { useAuth } from "./client";

// All authentication entry points lead to the same credential-based flow.
export function SignInModal() {
  const { isSignInModalOpen, closeSignInModal } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isSignInModalOpen) dialog.current?.showModal();
    else dialog.current?.close();
  }, [isSignInModalOpen]);
  return (
    <dialog ref={dialog} onCancel={closeSignInModal} aria-labelledby="sign-in-title" className="bg-white p-6">
        <h2 id="sign-in-title">Sign in to BuildGen</h2>
        <p>A registered account is required to access member features.</p>
        <Link href="/sign-in" onClick={closeSignInModal}>Sign in</Link>{" / "}
        <Link href="/sign-in?mode=signup" onClick={closeSignInModal}>Create an account</Link>{" "}
        <button type="button" onClick={closeSignInModal}>Close</button>
    </dialog>
  );
}

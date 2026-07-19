import { redirect } from "next/navigation";

/** Alph Command Center now lives on the home workspace. */
export default function AlphRedirectPage() {
  redirect("/");
}

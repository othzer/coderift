import { currentUser } from "@/modules/auth/actions";
import { Hero } from "@/modules/home/components/hero";
import { Features } from "@/modules/home/components/features";
import { HowItWorks } from "@/modules/home/components/how-it-works";
import { Templates } from "@/modules/home/components/templates";
import { Faq } from "@/modules/home/components/faq";
import { Cta } from "@/modules/home/components/cta";
import { SignedInHome } from "@/modules/home/components/signed-in-home";

export default async function Home() {
  const user = await currentUser();

  // Signed-in visitors get a "resume your work" view; the marketing page is
  // only useful to someone who hasn't signed up yet.
  if (user) {
    return <SignedInHome name={user.name} />;
  }

  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Templates />
      <Faq />
      <Cta />
    </>
  );
}

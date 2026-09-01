import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Blog() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-20 sm:py-32 text-center">
        <p className="font-mono text-sm leading-relaxed opacity-60">nothing here yet :(</p>
      </section>
      <Footer />
    </div>
  );
}

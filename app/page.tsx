import NavBar from "./components/NavBar";
import HeroTitle from "./components/HeroTitle";
import ProjectCard from "./components/ProjectCard";
import ScrambleLink from "./components/ScrambleLink";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <section
        id="about"
        className="mx-auto flex min-h-screen max-w-3xl scroll-mt-24 flex-col items-center justify-center px-4 py-20 sm:py-32 text-center"
      >
        <HeroTitle realName="ALI ABDUL GAFUR" alias="ZEROFUNCTION" />
        <p className="mt-6 max-w-md font-mono text-sm leading-relaxed opacity-60">
          Student at Arab Open University, Kuwait. Learning to specialize in Software Engineering. <br />
        </p>
        <div className="mx-auto flex items-center justify-center gap-4 pt-6">
          <a href="https://github.com/0funcc" target="_blank" rel="noopener noreferrer">
            <img src="/github.svg" alt="GitHub" />
          </a>
          <a href="https://instagram.com/0func" target="_blank" rel="noopener noreferrer">
            <img src="/instagram.svg" alt="Instagram" />
          </a>
          <a href="https://linkedin.com/in/0func" target="_blank" rel="noopener noreferrer">
            <img src="/linkedin.svg" alt="LinkedIn" />
          </a>
        </div>
      </section>
      <section
        id="projects"
        className="mx-auto flex min-h-screen max-w-3xl scroll-mt-24 flex-col items-center justify-center px-4 py-20 sm:py-32 text-center"
      >
        <h2 className="mt-6 max-w-md self-start font-pixel text-2xl font-bold text-foreground text-left">
          [ PROJECTS ]
        </h2>
        <div className="mt-10 grid w-full grid-cols-1 gap-8 sm:grid-cols-2">
          <ProjectCard
            title="Tempora"
            image="/project-images/tempora.jpeg"
            description="A native Pomodoro timer for Windows 11. Stay focused, take breaks, get things done. Built natively with WinUI 3 and C#."
            href="https://github.com/0funcc/Tempora"
          />
        </div>
      </section>
      <section
        id="contact"
        className="mx-auto flex min-h-screen max-w-3xl scroll-mt-24 flex-col items-center justify-center px-4 py-20 sm:py-32 text-center"
      >
        <h2 className="mt-6 max-w-md self-start font-pixel text-2xl font-bold text-foreground text-left">
          [ CONTACT ]
        </h2>
        <div className="mt-6 grid w-full grid-cols-1 gap-8 text-left sm:grid-cols-2">
          <p className="font-mono text-sm leading-relaxed opacity-60">
            Let&apos;s connect, open to projects and collabs.
          </p>
          <div className="flex flex-col items-start gap-3">
            <ScrambleLink
              href="https://github.com/0funcc"
              label="GITHUB"
              icon="/github.svg"
              iconPosition="left"
              target="_blank"
              className="text-accent"
            />
            <ScrambleLink
              href="https://instagram.com/0func"
              label="INSTAGRAM"
              icon="/instagram.svg"
              iconPosition="left"
              target="_blank"
              className="text-accent"
            />
            <ScrambleLink
              href="https://linkedin.com/in/0func"
              label="LINKEDIN"
              icon="/linkedin.svg"
              iconPosition="left"
              target="_blank"
              className="text-accent"
            />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

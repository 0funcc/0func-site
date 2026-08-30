"use client";

import { useLenis } from "lenis/react";
import ScrambleLink from "./ScrambleLink";
import FitText from "./FitText";

export default function Footer() {
    const lenis = useLenis();

    const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        lenis?.scrollTo(id, { offset: -96 });
    };

    return (
        <footer className="flex min-h-[50vh] w-full flex-col overflow-hidden bg-accent text-foreground">
            <div className="flex w-full items-start px-6 pt-10">
                <div className="w-3/4">
                    <FitText text="ZEROFUNCTION" weight={400} className="font-pixel" />
                    <FitText text="BASED IN KUWAIT" weight={400} className="font-pixel" />
                    <FitText
                        text="WHY STICK TO ONE MEDIUM WHEN EVERYTHING IS FUCKING INTERESTING"
                        weight={400}
                        className="mt-4 font-pixel"
                    />
                    <FitText text="CREATING APPS, WEBSITES, GAMES & MORE" weight={400} className="font-pixel" />
                </div>

                <div className="flex w-1/4 flex-col items-end gap-8 text-right">
                    <div className="flex flex-col items-end gap-3">
                        <ScrambleLink href="#about" label="ABOUT" onClick={scrollTo("#about")} />
                        <ScrambleLink href="#projects" label="PROJECTS" onClick={scrollTo("#projects")} />
                        <ScrambleLink href="#contact" label="CONTACT" onClick={scrollTo("#contact")} />
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <ScrambleLink href="https://github.com/0funcc" label="GITHUB" target="_blank" />
                        <ScrambleLink href="https://instagram.com/0func" label="INSTAGRAM" target="_blank" />
                        <ScrambleLink href="https://linkedin.com/in/0func" label="LINKEDIN" target="_blank" />
                    </div>
                </div>
            </div>

            <div className="relative mt-auto h-64 sm:h-96">
                <img
                    src="/0func-logo.svg"
                    alt=""
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 left-0 w-full translate-y-1/2"
                />
            </div>
        </footer>
    );
}

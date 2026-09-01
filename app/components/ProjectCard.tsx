"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import ScrambleLink from "./ScrambleLink";
import { noisyColumn } from "./asciiNoise";
import useIsMobile from "../hooks/useIsMobile";

export default function ProjectCard({
    title,
    description,
    image,
    imageAlt,
    href,
}: {
    title: string;
    description: string;
    image?: string;
    imageAlt?: string;
    href?: string;
}) {
    const boxRef = useRef<HTMLDivElement>(null);
    const probeRef = useRef<HTMLSpanElement>(null);
    const boxProbeRef = useRef<HTMLSpanElement>(null);
    const expandRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [cols, setCols] = useState(0);
    const [boxCharsPerCol, setBoxCharsPerCol] = useState(1);
    const [lineHeightPx, setLineHeightPx] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [settling, setSettling] = useState(false);
    const [descHeight, setDescHeight] = useState<number | "auto">(0);
    const [mobileExpanded, setMobileExpanded] = useState(false);
    const expandedHeight = useRef(0);
    const heightRef = useRef(0);
    const heightProxy = useRef({ h: 0 });
    const isMobile = useIsMobile();

    useEffect(() => {
        const box = boxRef.current;
        const probe = probeRef.current;
        const boxProbe = boxProbeRef.current;
        if (!box || !probe || !boxProbe) return;

        // Measuring before the webfont has actually loaded would freeze
        // fallback-font metrics into the layout math, so re-measure once
        // the real font is confirmed ready (a no-op if it already was).
        const measure = () => {
            const probeRect = probe.getBoundingClientRect();
            const charWidth = probeRect.width / 100;
            setLineHeightPx(probeRect.height);
            // Box-drawing glyphs (─│┌┐└┘) don't necessarily render at the
            // same width as regular characters in every font, so this
            // tracks the conversion ratio between "cols" (regular-char
            // units) and how many box-drawing glyphs are needed to
            // visually span the same distance.
            const boxCharWidth = boxProbe.getBoundingClientRect().width / 50;
            setBoxCharsPerCol(charWidth / boxCharWidth);
            setCols(Math.floor(box.clientWidth / charWidth));
        };

        measure();
        document.fonts.ready.then(measure);
        const ro = new ResizeObserver(measure);
        ro.observe(box);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const expand = expandRef.current;
        if (!expand) return;

        const update = () => {
            expandedHeight.current = expand.scrollHeight;
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(expand);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        const update = () => setContentHeight(content.clientHeight);

        update();
        const ro = new ResizeObserver(update);
        ro.observe(content);
        return () => ro.disconnect();
    }, []);

    const { contextSafe } = useGSAP({ scope: boxRef });

    const tweenHeight = contextSafe((target: number) => {
        gsap.killTweensOf(heightProxy.current);
        heightProxy.current.h = heightRef.current;
        const distance = Math.abs(target - heightRef.current);

        setSettling(true);
        gsap.to(heightProxy.current, {
            h: target,
            duration: 0.15,
            ease: `steps(${Math.max(Math.round(distance / 4), 1)})`,
            onUpdate: () => {
                heightRef.current = heightProxy.current.h;
                setDescHeight(heightRef.current);
            },
            onComplete: () => {
                setSettling(false);
                // once fully expanded, let it size naturally so any measurement
                // drift (image aspect-ratio settling, font metrics, etc.) can
                // never clip the content — the fixed px height was only needed
                // mid-animation for the stepped reveal.
                if (target > 0) setDescHeight("auto");
            },
        });
    });

    // Hover has no equivalent on touch, so the card is tap-toggled on
    // mobile instead. Crossing back over the breakpoint should collapse it
    // rather than leave it stuck open with no hover to close it.
    useEffect(() => {
        if (isMobile || !mobileExpanded) return;
        setMobileExpanded(false);
        if (expandRef.current) {
            heightRef.current = expandRef.current.scrollHeight;
            setDescHeight(heightRef.current);
        }
        tweenHeight(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile]);

    const inner = Math.max(Math.round(cols * boxCharsPerCol) - 2, 0);
    const border = "─".repeat(inner);
    const rows = lineHeightPx > 0 ? Math.floor(contentHeight / lineHeightPx) : 0;
    const edge = noisyColumn(rows, settling);
    // Mirrors `group-hover:text-foreground` for mobile, where there's no
    // hover to trigger it — an expanded card gets the same accent color.
    const accentClass = mobileExpanded ? "text-foreground" : "text-accent group-hover:text-foreground";

    const content = (
        <div
            ref={boxRef}
            onMouseEnter={() => {
                if (isMobile) return;
                tweenHeight(expandedHeight.current);
            }}
            onMouseLeave={() => {
                if (isMobile) return;
                if (expandRef.current) {
                    heightRef.current = expandRef.current.scrollHeight;
                    setDescHeight(heightRef.current);
                }
                tweenHeight(0);
            }}
            onClick={() => {
                if (!isMobile) return;
                const next = !mobileExpanded;
                setMobileExpanded(next);
                if (next) {
                    tweenHeight(expandedHeight.current);
                } else {
                    if (expandRef.current) {
                        heightRef.current = expandRef.current.scrollHeight;
                        setDescHeight(heightRef.current);
                    }
                    tweenHeight(0);
                }
            }}
            className={`group relative w-full overflow-hidden bg-background text-left font-mono text-sm leading-none text-foreground ${
                isMobile ? "cursor-pointer" : ""
            }`}
        >
            <span ref={probeRef} aria-hidden="true" className="absolute invisible whitespace-pre">
                {"0".repeat(100)}
            </span>
            <span ref={boxProbeRef} aria-hidden="true" className="absolute invisible whitespace-pre">
                {"─".repeat(50)}
            </span>

            <div aria-hidden="true" className={`whitespace-pre ${accentClass}`}>
                {"┌" + border + "┐"}
            </div>

            <div className="flex items-start" style={{ width: `${cols}ch` }}>
                <div
                    aria-hidden="true"
                    // The stacked "│" column renders a couple px off from the
                    // same glyph inside the "┌───┐" border strings (same
                    // font-shaping quirk as the navbar's isolated pipe) —
                    // nudged to match visually.
                    style={{ height: contentHeight, position: "relative", left: "0.116em" }}
                    className={`overflow-hidden whitespace-pre-line ${accentClass}`}
                >
                    {edge}
                </div>
                <div ref={contentRef} className="flex-1 px-4 py-4">
                    <h3 className="font-pixel text-lg font-bold tracking-tight uppercase">{title}</h3>
                    <div
                        style={{ height: descHeight === "auto" ? "auto" : `${descHeight}px` }}
                        className="overflow-hidden"
                    >
                        <div ref={expandRef}>
                            {image && (
                                <div className="relative mt-3 aspect-video w-full overflow-hidden border border-foreground/20">
                                    <Image
                                        src={image}
                                        alt={imageAlt ?? title}
                                        fill
                                        sizes="(min-width: 768px) 33vw, 100vw"
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <p className="pt-3 leading-relaxed opacity-60">{description}</p>
                            {href && (
                                <ScrambleLink
                                    href={href}
                                    label="VISIT"
                                    icon="/arrow.svg"
                                    target="_blank"
                                    className="mt-3 text-accent"
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div
                    aria-hidden="true"
                    style={{ height: contentHeight, position: "relative", left: "0.196em" }}
                    className={`overflow-hidden whitespace-pre-line ${accentClass}`}
                >
                    {edge}
                </div>
            </div>

            <div aria-hidden="true" className={`whitespace-pre ${accentClass}`}>
                {"└" + border + "┘"}
            </div>
        </div>
    );

    return content;
}

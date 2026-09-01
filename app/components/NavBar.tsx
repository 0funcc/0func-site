"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import ScrambleLink from "./ScrambleLink";
import { noisyLine } from "./asciiNoise";
import useIsMobile from "../hooks/useIsMobile";

const LINK_FADE_MS = 150;

// Mobile island: fixed target sizes (not measured async) so the expand
// animation never depends on a scrollHeight race — the content is always
// exactly the same 3 links, so the target size is knowable up front.
// Width is expressed as a target pixel guide but actually driven in "ch"
// units (like the desktop box) so the "┌───┐" border text and the
// container's real width are computed from the exact same number — mixing
// independently-rounded px and char-count math is what caused the border
// corners to drift out of alignment with the "│" side edges.
const ISLAND_COLLAPSED_W_GUIDE = 64;
const ISLAND_EXPANDED_W_GUIDE = 200;
const ISLAND_LINK_ROW_H = 40; // h-10 per link row
const ISLAND_DEFAULT_CHAR_W = 8; // best-guess char width before first real measurement

export default function NavBar() {
    const boxRef = useRef<HTMLDivElement>(null);
    const probeRef = useRef<HTMLSpanElement>(null);
    const boxProbeRef = useRef<HTMLSpanElement>(null);
    const logoRef = useRef<HTMLImageElement>(null);
    const maxCols = useRef(0);
    const shrinkCols = useRef(0);
    const colsRef = useRef(0);
    const [cols, setCols] = useState(0);
    const [boxCharsPerCol, setBoxCharsPerCol] = useState(1);
    const [settling, setSettling] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [linksMounted, setLinksMounted] = useState(false);
    const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const islandRef = useRef<HTMLDivElement>(null);
    const islandProbeRef = useRef<HTMLSpanElement>(null);
    const islandBoxProbeRef = useRef<HTMLSpanElement>(null);
    const islandMenuContentRef = useRef<HTMLDivElement>(null);
    const islandCharWidth = useRef(ISLAND_DEFAULT_CHAR_W);
    const islandBoxCharsPerCol = useRef(1);
    const islandLineHeight = useRef(14);
    const islandCollapsedCols = useRef(Math.round(ISLAND_COLLAPSED_W_GUIDE / ISLAND_DEFAULT_CHAR_W));
    const islandExpandedCols = useRef(Math.round(ISLAND_EXPANDED_W_GUIDE / ISLAND_DEFAULT_CHAR_W));
    const islandColsRef = useRef(islandCollapsedCols.current);
    const [islandCols, setIslandCols] = useState(islandColsRef.current);
    const islandMenuHeightRef = useRef(0);
    const [islandMenuHeight, setIslandMenuHeight] = useState<number | "auto">(0);
    const [islandSettling, setIslandSettling] = useState(false);

    const isMobile = useIsMobile();
    const pathname = usePathname();
    // The #about/#projects/#contact ids only exist on the home page — on
    // any other route (e.g. /blog) these need to be real navigations back
    // to "/" rather than an in-page scroll to an id that isn't there.
    const isHome = pathname === "/";

    // Hover has no equivalent on touch, so the mobile island is tap-toggled
    // instead. Crossing back over the breakpoint (e.g. rotating a tablet,
    // resizing a window) should close it rather than leave it stuck open.
    useEffect(() => {
        if (!isMobile && expanded) setExpanded(false);
        // Only react to crossing the breakpoint, not every hover-driven
        // `expanded` toggle on desktop — otherwise this fires right after
        // a hover opens the nav and immediately closes it again.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile]);

    useEffect(() => {
        if (expanded) {
            if (unmountTimer.current) {
                clearTimeout(unmountTimer.current);
                unmountTimer.current = null;
            }
            setLinksMounted(true);
        } else {
            unmountTimer.current = setTimeout(() => setLinksMounted(false), LINK_FADE_MS);
        }
        return () => {
            if (unmountTimer.current) clearTimeout(unmountTimer.current);
        };
    }, [expanded]);

    useEffect(() => {
        if (isMobile) return;
        const box = boxRef.current;
        const probe = probeRef.current;
        const boxProbe = boxProbeRef.current;
        const logo = logoRef.current;
        if (!box || !probe || !boxProbe || !logo) return;

        // Measuring before the webfont has actually loaded would freeze
        // fallback-font metrics into the layout math, so re-measure once
        // the real font is confirmed ready (a no-op if it already was).
        const measure = () => {
            const charWidth = probe.getBoundingClientRect().width / 100;
            // Box-drawing glyphs (─│┌┐└┘) don't necessarily render at the
            // same width as regular characters in every font, so this
            // tracks the conversion ratio between "cols" (regular-char
            // units) and how many box-drawing glyphs are needed to
            // visually span the same distance.
            const boxCharWidth = boxProbe.getBoundingClientRect().width / 50;
            const charsPerCol = charWidth / boxCharWidth;
            setBoxCharsPerCol(charsPerCol);

            maxCols.current = Math.floor(box.clientWidth / charWidth);
            // logo width + horizontal padding (px-4 = 1rem each side) + 2 border chars
            const logoCols = Math.ceil(logo.getBoundingClientRect().width / charWidth);
            const borderCols = Math.ceil(2 / charsPerCol);
            shrinkCols.current = logoCols + Math.ceil(32 / charWidth) + borderCols;
        };

        const resetCols = () => {
            colsRef.current = shrinkCols.current;
            setCols(colsRef.current);
        };

        const onLogoLoad = () => {
            measure();
            resetCols();
        };

        measure();
        resetCols();
        document.fonts.ready.then(() => {
            measure();
            resetCols();
        });
        if (!logo.complete) logo.addEventListener("load", onLogoLoad);
        const ro = new ResizeObserver(measure);
        ro.observe(box);
        return () => {
            logo.removeEventListener("load", onLogoLoad);
            ro.disconnect();
        };
    }, [isMobile]);

    // Same font/size as the desktop box, so this ratio is measured the same
    // way purely to size the island's own "┌───┐" border to its own width.
    useEffect(() => {
        if (!isMobile) return;
        const probe = islandProbeRef.current;
        const boxProbe = islandBoxProbeRef.current;
        if (!probe || !boxProbe) return;

        const measure = () => {
            const probeRect = probe.getBoundingClientRect();
            islandCharWidth.current = probeRect.width / 100;
            islandLineHeight.current = probeRect.height;
            const boxCharWidth = boxProbe.getBoundingClientRect().width / 50;
            islandBoxCharsPerCol.current = islandCharWidth.current / boxCharWidth;

            islandCollapsedCols.current = Math.max(Math.round(ISLAND_COLLAPSED_W_GUIDE / islandCharWidth.current), 4);
            islandExpandedCols.current = Math.max(
                Math.round(ISLAND_EXPANDED_W_GUIDE / islandCharWidth.current),
                islandCollapsedCols.current + 4
            );

            // The initial collapsed width used a best-guess char width;
            // correct it once the real font metrics are in, but only while
            // still collapsed — an in-flight or completed expand shouldn't
            // be yanked back by a late measurement.
            if (!expanded) {
                islandColsRef.current = islandCollapsedCols.current;
                setIslandCols(islandColsRef.current);
            }
        };

        measure();
        document.fonts.ready.then(measure);
    }, [isMobile, expanded]);

    const lenis = useLenis();

    const { contextSafe } = useGSAP({ scope: boxRef });
    const { contextSafe: islandContextSafe } = useGSAP({ scope: islandRef });

    const tweenTo = contextSafe((target: number) => {
        const proxy = { n: colsRef.current };
        const distance = Math.abs(target - colsRef.current);

        setSettling(true);
        gsap.to(proxy, {
            n: target,
            duration: 0.2,
            ease: `steps(${Math.max(distance, 1)})`,
            onUpdate: () => {
                colsRef.current = Math.round(proxy.n);
                setCols(colsRef.current);
            },
            onComplete: () => setSettling(false),
        });
    });

    // Tweens the island's width (in "cols", matching the desktop box) and
    // its collapsible menu section's height together, for one cohesive
    // "morph" — same stepped, snapping easing as the desktop nav's hover
    // expand.
    const tweenIsland = islandContextSafe((targetCols: number, targetMenuH: number) => {
        const proxy = { cols: islandColsRef.current, h: islandMenuHeightRef.current };
        const colsDistance = Math.abs(targetCols - proxy.cols);
        const hDistance = Math.abs(targetMenuH - proxy.h);
        const steps = Math.max(colsDistance, Math.round(hDistance / 8), 1);

        setIslandSettling(true);
        gsap.to(proxy, {
            cols: targetCols,
            h: targetMenuH,
            duration: 0.25,
            ease: `steps(${steps})`,
            onUpdate: () => {
                islandColsRef.current = Math.round(proxy.cols);
                setIslandCols(islandColsRef.current);
                islandMenuHeightRef.current = proxy.h;
                setIslandMenuHeight(islandMenuHeightRef.current);
            },
            onComplete: () => {
                setIslandSettling(false);
                if (targetMenuH > 0) setIslandMenuHeight("auto");
            },
        });
    });

    const mobileLinks = [
        {
            href: "/#projects",
            label: "PROJECTS",
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!isHome) return;
                e.preventDefault();
                lenis?.scrollTo("#projects", { offset: -96 });
            },
        },
        { href: "/blog", label: "BLOG" },
        {
            href: "/#contact",
            label: "CONTACT",
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!isHome) return;
                e.preventDefault();
                lenis?.scrollTo("#contact", { offset: -96 });
            },
        },
    ];

    const closeMobileMenu = () => {
        setExpanded(false);
        if (islandMenuContentRef.current) {
            islandMenuHeightRef.current = islandMenuContentRef.current.scrollHeight;
            setIslandMenuHeight(islandMenuHeightRef.current);
        }
        tweenIsland(islandCollapsedCols.current, 0);
    };

    const toggleMobileMenu = () => {
        if (expanded) {
            closeMobileMenu();
            return;
        }
        setExpanded(true);
        const targetMenuH = islandLineHeight.current + mobileLinks.length * ISLAND_LINK_ROW_H;
        tweenIsland(islandExpandedCols.current, targetMenuH);
    };

    const inner = Math.max(Math.round(cols * boxCharsPerCol) - 2, 0);
    const islandInner = Math.max(Math.round(islandCols * islandBoxCharsPerCol.current) - 2, 0);

    if (isMobile) {
        return (
            <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
                <div
                    ref={islandRef}
                    className="relative overflow-hidden bg-background text-center font-mono text-sm leading-none text-foreground"
                    style={{ width: `${islandCols}ch` }}
                >
                    <span ref={islandProbeRef} aria-hidden="true" className="absolute invisible whitespace-pre">
                        {"0".repeat(100)}
                    </span>
                    <span ref={islandBoxProbeRef} aria-hidden="true" className="absolute invisible whitespace-pre">
                        {"─".repeat(50)}
                    </span>

                    <div aria-hidden="true" className="whitespace-pre">
                        {"┌" + noisyLine(islandInner, islandSettling) + "┐"}
                    </div>

                    <div className="flex h-14 items-center whitespace-pre">
                        <span aria-hidden="true" style={{ position: "relative", left: "0.27em" }}>
                            │
                        </span>
                        <button
                            type="button"
                            onClick={toggleMobileMenu}
                            aria-expanded={expanded}
                            aria-label={expanded ? "Close menu" : "Open menu"}
                            className="flex h-14 flex-1 items-center justify-center"
                        >
                            <img src="/0func-logo.svg" alt="0func Logo" className="h-6 w-auto" />
                        </button>
                        <span aria-hidden="true" style={{ position: "relative", left: "-0.15em" }}>
                            │
                        </span>
                    </div>

                    {/* Nested in its own overflow-hidden wrapper so the bottom
                        border below always sits flush against whatever's
                        actually visible — collapsed (nothing) or expanded
                        (separator + links) — instead of the box getting
                        clipped mid-stack and showing the separator as if it
                        were the closing border. */}
                    <div
                        style={{ height: islandMenuHeight === "auto" ? "auto" : `${islandMenuHeight}px` }}
                        className="overflow-hidden"
                    >
                        <div ref={islandMenuContentRef}>
                            <div aria-hidden="true" className="whitespace-pre">
                                {"├" + noisyLine(islandInner, islandSettling) + "┤"}
                            </div>
                            <div className="flex flex-col">
                                {mobileLinks.map((link) => (
                                    <div key={link.label} className="flex h-10 items-center whitespace-pre">
                                        <span aria-hidden="true" style={{ position: "relative", left: "0.27em" }}>
                                            │
                                        </span>
                                        <div className="flex flex-1 items-center justify-center">
                                            <ScrambleLink
                                                href={link.href}
                                                label={link.label}
                                                onClick={(e) => {
                                                    link.onClick?.(e);
                                                    closeMobileMenu();
                                                }}
                                            />
                                        </div>
                                        <span aria-hidden="true" style={{ position: "relative", left: "-0.15em" }}>
                                            │
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div aria-hidden="true" className="whitespace-pre">
                        {"└" + noisyLine(islandInner, islandSettling) + "┘"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 z-50 flex w-full flex-col items-center">
            <div
                ref={boxRef}
                onMouseEnter={() => {
                    setExpanded(true);
                    tweenTo(maxCols.current);
                }}
                onMouseLeave={() => {
                    setExpanded(false);
                    tweenTo(shrinkCols.current);
                }}
                className="relative mx-4 mt-4 w-full max-w-3xl text-center font-mono text-sm leading-none overflow-hidden"
            >
                <span ref={probeRef} aria-hidden="true" className="absolute invisible whitespace-pre">
                    {"0".repeat(100)}
                </span>
                <span ref={boxProbeRef} aria-hidden="true" className="absolute invisible whitespace-pre">
                    {"─".repeat(50)}
                </span>

                <div className="mx-auto bg-background text-foreground" style={{ width: `${cols}ch` }}>
                    <div aria-hidden="true" className="whitespace-pre">
                        {"┌" + noisyLine(inner, settling) + "┐"}
                    </div>

                    <nav className="flex items-center whitespace-pre">
                        {/* A lone "│" renders a couple px off from the same
                            glyph inside the "┌───┐" border strings (likely a
                            font-shaping difference for an isolated glyph vs.
                            one in a longer run) — nudged to match visually. */}
                        <span aria-hidden="true" style={{ position: "relative", left: "0.27em" }}>
                            │
                        </span>
                        <div
                            className={`flex flex-1 items-center px-4 py-3 ${
                                linksMounted ? "justify-between" : "justify-center"
                            }`}
                        >
                            <a
                                href="/#about"
                                onClick={(e) => {
                                    if (!isHome) return;
                                    e.preventDefault();
                                    lenis?.scrollTo("#about", { offset: -96 });
                                }}
                                className="shrink-0"
                            >
                                <img
                                    ref={logoRef}
                                    src="/0func-logo.svg"
                                    alt="0func Logo"
                                    className="h-8 w-auto max-w-none shrink-0"
                                />
                            </a>
                            {linksMounted && (
                                <>
                                    <ScrambleLink
                                        href="/#projects"
                                        label="PROJECTS"
                                        autoPlayDelay={0.05}
                                        visible={expanded}
                                        onClick={(e) => {
                                            if (!isHome) return;
                                            e.preventDefault();
                                            lenis?.scrollTo("#projects", { offset: -96 });
                                        }}
                                    />
                                    <ScrambleLink href="/blog" label="BLOG" autoPlayDelay={0.15} visible={expanded} />
                                    <ScrambleLink
                                        href="/#contact"
                                        label="CONTACT"
                                        autoPlayDelay={0.1}
                                        visible={expanded}
                                        onClick={(e) => {
                                            if (!isHome) return;
                                            e.preventDefault();
                                            lenis?.scrollTo("#contact", { offset: -96 });
                                        }}
                                    />
                                </>
                            )}
                        </div>
                        <span aria-hidden="true" style={{ position: "relative", left: "-0.15em" }}>
                            │
                        </span>
                    </nav>

                    <div aria-hidden="true" className="whitespace-pre">
                        {"└" + noisyLine(inner, settling) + "┘"}
                    </div>
                </div>
            </div>
        </div>
    );
}

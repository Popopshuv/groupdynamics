/**
 * Blessed section config: per-section content for the scattered grid.
 * Each section maps to a data folder and defines text links + media with descriptions.
 */

const VIDEO_EXTENSIONS = [".mov", ".mp4", ".webm"];

function isVideo(filename: string): boolean {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return VIDEO_EXTENSIONS.some((e) => ext === e);
}

/** Text link: display text + optional audio text (spoken on hover) + optional url to route to */
export type TextLink = {
  text: string;
  audioText?: string;
  /** When provided, the link navigates to this URL */
  url?: string;
};

/** Media item for grid/modal */
export type MediaItem = {
  src: string;
  type: "image" | "video";
  description: string; // shown in modal; hover uses random from pool
};

/** Section config: label, text links, media, and hover description pool */
export type SectionConfig = {
  label: string;
  /** Folder under /data/ containing media files. Defaults to label if omitted. */
  folder?: string;
  textLinks: TextLink[];
  media: { filename: string }[];
  /** Pool of descriptions; one is randomly assigned per media on hover */
  hoverDescriptions: string[];
};

const DATA_BASE = "/data";

/** Build media items from filenames; each gets a random description from the pool */
export function buildMediaItems(
  folder: string,
  filenames: string[],
  hoverDescriptions: string[],
): MediaItem[] {
  return filenames.map((filename) => {
    const type = isVideo(filename) ? "video" : "image";
    const src = `${DATA_BASE}/${folder}/${filename}`;
    const description =
      hoverDescriptions[Math.floor(Math.random() * hoverDescriptions.length)] ??
      hoverDescriptions[0];
    return { src, type, description };
  });
}

/** Pick a random description from the pool (for hover speak) */
export function getRandomDescription(pool: string[]): string {
  if (pool.length === 0) return "";
  return pool[Math.floor(Math.random() * pool.length)];
}

/** All sections - edit textLinks, media filenames, and hoverDescriptions per section */
export const BLESSED_SECTIONS: SectionConfig[] = [
  {
    label: "group1",
    folder: "group4",
    textLinks: [
      {
        text: "hathenbruck",
        audioText: "hathen brook",
        url: "https://www.gq.com/story/hathenbruck-vending-machines-interview",
      },
      {
        text: "gwt",
        audioText: "g w t dot l l c",
        url: "https://www.instagram.com/gwt.llc/?hl=en",
      },
    ],
    media: [
      { filename: "1.webp" },
      { filename: "2.webp" },
      { filename: "3.webp" },
      { filename: "4.webp" },
      { filename: "5.webp" },
      { filename: "6.webp" },
      { filename: "7.webp" },
      { filename: "8.webp" },
      { filename: "9.webp" },
      { filename: "10.webp" },
    ],
    hoverDescriptions: [
      "The future of the internet is a meme.",
      "The algorithm is the new editor.",
      "Clout is the new currency.",
      "Screens are the new streets.",
      "Going viral is the new going global.",
      "Notifications are the new heartbeat.",
      "Bandwidth is the new oxygen.",
      "Your feed is your mirror.",
      "Data is the new autobiography.",
      "Influence is the new infrastructure.",
      "The scroll is the new commute.",
      "Comments are the new conversations.",
      "Links are the new roads.",
      "The timeline is the new town square.",
      "Going offline is the new luxury.",
    ],
  },
  {
    label: "group2",
    textLinks: [
      {
        text: "chillbies",
        audioText: "chillbies",
        url: "https://www.instagram.com/chillbies/?hl=en",
      },
    ],
    media: [
      { filename: "1.mp4" },
      { filename: "7.png" },
      { filename: "8.png" },
      { filename: "2.webp" },
      { filename: "3.webp" },
    ],
    hoverDescriptions: [
      "good energy.",
      "The scroll is the new commute.",
      "Comments are the new conversations.",
      "Links are the new roads.",
      "The timeline is the new town square.",
      "Going offline is the new luxury.",
    ],
  },
  {
    label: "group3",
    textLinks: [
      {
        text: "good zones",
        audioText: "damn, what a good zone",
        url: "https://www.goodzones.com",
      },
      {
        text: "bruhlers",
        audioText: "brew-lers",
        url: "https://www.instagram.com/p/CN_fv78F007/?hl=en",
      },
      {
        text: "surroundings.site",
        audioText: "surroundings dot site",
        url: "https://surroundings.site",
      },
    ],
    media: [
      { filename: "1.webp" },
      { filename: "2.mp4" },
      { filename: "3.webp" },
      { filename: "4.webp" },
      { filename: "5.webp" },
      { filename: "6.webp" },
    ],
    hoverDescriptions: [
      "good energy.",
      "The scroll is the new commute.",
      "Comments are the new conversations.",
      "Links are the new roads.",
      "The timeline is the new town square.",
      "Going offline is the new luxury.",
    ],
  },
  {
    label: "group4",
    folder: "group1",
    textLinks: [
      {
        text: "big data",
        audioText: "big data",
        url: "https://hypebeast.com/2020/10/caleb-flowers-bigdata-we-are-who-we-are-hbo-show-digital-zine-info",
      },
    ],
    media: [
      { filename: "1.mp4" },
      { filename: "2.webp" },
      { filename: "3.webp" },
      { filename: "4.webp" },
      { filename: "5.webp" },
      { filename: "6.webp" },
      { filename: "7.webp" },
    ],
    hoverDescriptions: [
      "The future of the internet is a meme.",
      "The algorithm is the new editor.",
      "Clout is the new currency.",
      "Screens are the new streets.",
      "Going viral is the new going global.",
      "Notifications are the new heartbeat.",
      "Bandwidth is the new oxygen.",
      "Your feed is your mirror.",
      "Data is the new autobiography.",
      "Influence is the new infrastructure.",
      "The scroll is the new commute.",
      "Comments are the new conversations.",
      "Links are the new roads.",
      "The timeline is the new town square.",
      "Going offline is the new luxury.",
    ],
  },
  {
    label: "group5",
    textLinks: [
      {
        text: "nike",
        audioText: "nike",
        url: "https://www.nike.com/launch/t/nike-stussy-apparel-collection-static-1",
      },
    ],
    media: [
      { filename: "1.webp" },
      { filename: "2.webp" },
      { filename: "3.webp" },
      { filename: "8.mp4" },
      { filename: "7.png" },
      { filename: "4.webp" },
      { filename: "5.mp4" },
      { filename: "6.webp" },
      { filename: "6.mp4" },
    ],
    hoverDescriptions: [
      "The future of the internet is a meme.",
      "The algorithm is the new editor.",
      "Clout is the new currency.",
      "Screens are the new streets.",
      "Going viral is the new going global.",
      "Notifications are the new heartbeat.",
      "Bandwidth is the new oxygen.",
      "Your feed is your mirror.",
      "Data is the new autobiography.",
      "Influence is the new infrastructure.",
      "The scroll is the new commute.",
      "Comments are the new conversations.",
      "Links are the new roads.",
      "The timeline is the new town square.",
      "Going offline is the new luxury.",
    ],
  },
  {
    label: "group6",
    textLinks: [
      {
        text: "stu",
        audioText: "stussy",
        url: "https://www.instagram.com/p/DDZ-5pVy-Iu/?hl=en",
      },
    ],
    media: [
      { filename: "1.webp" },
      { filename: "2.webp" },
      { filename: "3.webp" },
      { filename: "4.webp" },
      { filename: "5.webp" },
      { filename: "6.jpg" },
      { filename: "7.jpg" },
    ],
    hoverDescriptions: [
      "The future of the internet is a meme.",
      "The algorithm is the new editor.",
      "Clout is the new currency.",
      "Screens are the new streets.",
      "Going viral is the new going global.",
      "Notifications are the new heartbeat.",
      "Bandwidth is the new oxygen.",
      "Your feed is your mirror.",
      "Data is the new autobiography.",
      "Influence is the new infrastructure.",
      "The scroll is the new commute.",
      "Comments are the new conversations.",
      "Links are the new roads.",
      "The timeline is the new town square.",
      "Going offline is the new luxury.",
    ],
  },
  {
    label: "group7",
    folder: "group7",
    textLinks: [
      {
        text: "matthewpothier",
        audioText: "matthew pothier",
        url: "https://matthewpothier.com",
      },
      {
        text: "bruto",
        audioText: "bruto denver",
        url: "https://brutodenver.com",
      },
      {
        text: "the wolfs tailor",
        audioText: "the worlfs tailor",
        url: "https://thewolfstailor.com",
      },
      {
        text: "bradyperron",
        audioText: "brady perron",
        url: "https://bradyperron.com",
      },
    ],
    media: [
      { filename: "1.webp" },
      { filename: "3.mp4" },
      // { filename: "4.mp4" },
      { filename: "5.mp4" },
      { filename: "6.mp4" },
      { filename: "111.mp4" },
      // { filename: "11.webp" },
      // { filename: "12.webp" },
      // { filename: "13.webp" },
      { filename: "110.mp4" },
      { filename: "15.mp4" },
      { filename: "102.png" },
    ],
    hoverDescriptions: [
      "The future of the internet is a meme.",
      "The algorithm is the new editor.",
      "Clout is the new currency.",
      "Screens are the new streets.",
      "Going viral is the new going global.",
      "Notifications are the new heartbeat.",
      "Bandwidth is the new oxygen.",
      "Your feed is your mirror.",
      "Data is the new autobiography.",
      "Influence is the new infrastructure.",
      "The scroll is the new commute.",
      "Comments are the new conversations.",
      "Links are the new roads.",
      "The timeline is the new town square.",
      "Going offline is the new luxury.",
    ],
  },
  {
    label: "group8",
    folder: "group7",
    textLinks: [
      {
        text: "time well wasted",
        audioText: "time well wasted",
        url: "https://www.timewellwasted.online/",
      },
      {
        text: "mushfactory",
        audioText: "mushfactory audio visualizer",
        url: "https://practical-wozniak-1a3218.netlify.app//",
      },
    ],
    media: [
      { filename: "2.mp4" },
      { filename: "7.mp4" },
      { filename: "101.mp4" },
      { filename: "10.mp4" },
      { filename: "112.mp4" },
      { filename: "14.webp" },
      { filename: "100.mp4" },
    ],
    hoverDescriptions: [
      "The future of the internet is a meme.",
      "The algorithm is the new editor.",
      "Clout is the new currency.",
      "Screens are the new streets.",
      "Going viral is the new going global.",
      "Notifications are the new heartbeat.",
      "Bandwidth is the new oxygen.",
      "Your feed is your mirror.",
      "Data is the new autobiography.",
      "Influence is the new infrastructure.",
      "The scroll is the new commute.",
      "Comments are the new conversations.",
      "Links are the new roads.",
      "The timeline is the new town square.",
      "Going offline is the new luxury.",
    ],
  },
];

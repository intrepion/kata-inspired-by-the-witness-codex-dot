export const regions = [
  {
    name: "The landing",
    subtitle: "Where the water remembers",
    color: "#b6cabb",
    story:
      "You arrive with an empty notebook. Someone tended this island long before you. Three tablets lie beside a dry channel.",
    memory:
      "The channel stirs. A note in the moss reads: “Begin with a small kindness. The garden will answer.”",
  },
  {
    name: "The orchard",
    subtitle: "A place for everything",
    color: "#ced49a",
    story:
      "Leaves fall among pale stones. In the orchard, nothing is misplaced, but some things need room to breathe.",
    memory:
      "Between the roots: “We did not build walls to keep each other away. We built rooms so every living thing could flourish.”",
  },
  {
    name: "The terraces",
    subtitle: "The weight of an edge",
    color: "#ddb391",
    story:
      "Wind combs the terraces. Tiny cuts in old tablets echo the shapes of the stonework around them.",
    memory:
      "A mason’s inscription: “Enough is not always more. A thing is whole when it has exactly what it needs.”",
  },
  {
    name: "The lantern garden",
    subtitle: "Bring the little things together",
    color: "#b5c8de",
    story:
      "Above the sea, the last garden gathers every lesson. Two lanterns mark a trail through the reeds: the south tree (1,2), then the east reed (2,1).",
    memory:
      "“I planted this garden for a stranger. If you are here, I was right to hope.”",
  },
];
export function scene(region: number, lit: boolean): string {
  const c = regions[region].color;
  const trees = Array.from({ length: 13 }, (_, i) => {
    const x = 55 + ((i * 137) % 870),
      y = 160 + ((i * 83) % 220);
    return `<g transform="translate(${x} ${y})"><path d="M0 0v65" stroke="#475c4b" stroke-width="7"/><ellipse cy="-5" rx="${24 + (i % 3) * 7}" ry="36" fill="${i % 2 ? "#6e8e73" : "#829b72"}"/><ellipse cx="-12" cy="4" rx="23" ry="25" fill="#91ab82"/></g>`;
  }).join("");
  return `<svg class="scene" viewBox="0 0 1000 460" role="img" aria-label="${regions[region].name}, an island garden with paths, trees, terraces and a lantern"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${c}"/><stop offset="1" stop-color="#e5e3c9"/></linearGradient><linearGradient id="sea" x2="0" y2="1"><stop stop-color="#6b9493"/><stop offset="1" stop-color="#244e58"/></linearGradient></defs><rect width="1000" height="460" fill="url(#sky)"/><circle cx="790" cy="80" r="36" fill="#fff2cb" opacity=".8"/><path d="M0 175Q180 110 360 170T720 150T1000 160V460H0Z" fill="url(#sea)"/><path d="M60 400Q5 245 180 205Q340 100 490 155Q650 90 850 220Q1040 360 875 430Z" fill="#708b70"/><path d="M88 387Q185 280 280 304T505 245T755 260T890 379" fill="none" stroke="#bbc1a1" stroke-width="32"/><path d="M130 402Q220 320 325 344T535 289T795 325" fill="none" stroke="#495e54" stroke-width="8"/>${trees}<g fill="#ccd0b3" stroke="#748373" stroke-width="3"><path d="M520 340l100-25 100 30-100 28z"/><path d="M540 315l80-23 80 27-80 24z"/><path d="M560 289l60-18 60 21-60 20z"/></g><g transform="translate(620 225)"><path d="M0 0v60" stroke="#495747" stroke-width="8"/><path d="M-18-4h36v33h-36z" fill="${lit ? "#ffe9a4" : "#acbcb0"}" stroke="#495747" stroke-width="5"/>${lit ? '<circle cy="12" r="45" fill="#ffe9a4" opacity=".2"/>' : ""}<path d="M-24-6L0-24 24-6z" fill="#495747"/></g>${region === 1 ? '<g fill="#d4ba77"><circle cx="230" cy="305" r="5"/><circle cx="480" cy="288" r="5"/><circle cx="350" cy="200" r="5"/><circle cx="680" cy="205" r="5"/></g>' : region === 2 ? '<g stroke="#d1c5a5" stroke-width="14"><path d="M250 370l110-30M280 343l110-30M310 316l110-30"/></g>' : region === 3 ? '<g stroke="#eadca7" stroke-width="4" fill="#f5dfaa"><path d="M360 345v-55M790 295v-55"/><rect x="350" y="277" width="20" height="20"/><rect x="780" y="227" width="20" height="20"/></g>' : ""}<g fill="#e5e1bb" opacity=".5"><path d="M30 430h90v3H30zM770 437h110v3H770zM805 176h140v2H805z"/></g></svg>`;
}
